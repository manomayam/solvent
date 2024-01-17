//! A tauri app that manages multiple pod views and serve
//! solid-os interface over them.
//!  

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![warn(missing_docs)]
#![deny(unused_qualifications)]

use std::sync::Arc;

use futures::TryFutureExt;
use http_uri::invariant::AbsoluteHttpUri;
use manas_space::BoxError;
use podverse_manager::{
    config::{LRcpPodConfig, LRcpPodverseConfig},
    PodverseManager,
};
use secrecy::ExposeSecret;
use state::AppState;
use tauri::{utils::config::AppUrl, AppHandle, Manager, WindowBuilder, WindowUrl};
use tracing::error;

// pub mod command;
pub mod podverse_manager;
pub mod state;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Get the podverse proxy endpoint.
#[tauri::command]
fn podverse_proxy_endpoint(state: tauri::State<AppState>) -> AbsoluteHttpUri {
    state.podverse_manager.proxy_endpoint().clone()
}

/// Get the podverse proxy secret token.
#[tauri::command]
fn podverse_proxy_session_secret_token(state: tauri::State<AppState>) -> String {
    state
        .podverse_manager
        .proxy_session_secret_token()
        .expose_secret()
        .clone()
}

/// Get the podverse config.
#[tauri::command]
async fn podverse_config(state: tauri::State<'_, AppState>) -> Result<LRcpPodverseConfig, String> {
    Ok(state.podverse_manager.podverse_config().await.clone())
}

/// Provision a new proxy pods.
#[tauri::command]
async fn provision_proxy_pod(
    new_pod_config: LRcpPodConfig,
    state: tauri::State<'_, AppState>,
    app_handle: AppHandle,
) -> Result<(), String> {
    state
        .podverse_manager
        .provision_pod(new_pod_config)
        .await
        .map_err(|e| e.to_string())?;

    emit_podverse_config_change_event(&state, &app_handle).await?;
    Ok(())
}

/// Emit an event to all windows notifying podverse config change.
async fn emit_podverse_config_change_event(
    state: &tauri::State<'_, AppState>,
    app_handle: &AppHandle,
) -> Result<(), String> {
    app_handle
        .emit_all(
            "podverse_config_change",
            state.podverse_manager.podverse_config().await.clone(),
        )
        .map_err(|e| format!("Error in emitting config change event.{e}"))
}

#[tokio::main]
async fn main() -> Result<(), BoxError> {
    tauri::async_runtime::set(tokio::runtime::Handle::current());

    let port = portpicker::pick_unused_port().expect("failed to find unused port");
    let mut context = tauri::generate_context!();
    let url = format!("http://localhost:{}", port).parse().unwrap();
    let window_url = WindowUrl::External(url);
    // rewrite the config so the IPC is enabled on this URL
    context.config_mut().build.dist_dir = AppUrl::Url(window_url.clone());

    let podverse_manager = Arc::new(
        PodverseManager::new(Arc::new(context.config().clone()), cfg!(dev))
            .inspect_err(|e| error!("Error in initializing the recipe. {e}"))
            .await?,
    );

    // Span podverse proxy.
    tokio::spawn(podverse_manager.serve_proxy());

    tauri::Builder::default()
        .plugin(tauri_plugin_persisted_scope::init())
        .plugin(tauri_plugin_localhost::Builder::new(port).build())
        .manage(AppState {
            podverse_manager: podverse_manager.clone(),
        })
        .invoke_handler(tauri::generate_handler![
            podverse_proxy_endpoint,
            podverse_proxy_session_secret_token,
            podverse_config,
            provision_proxy_pod,
            greet,
        ])
        .setup(move |app| {
            WindowBuilder::new(
                app,
                "main".to_string(),
                if cfg!(dev) {
                    Default::default()
                } else {
                    window_url
                },
            )
            .title("Solvent")
            .build()?;

            Ok(())
        })
        .run(context)
        .expect("error while running tauri application");

    Ok(())
}

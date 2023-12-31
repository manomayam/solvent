//! I provide types to represent state of the app.

use std::sync::Arc;

use crate::podverse_manager::PodverseManager;

/// A struct to represent app state.
#[derive(Debug)]
pub struct AppState {
    /// Podverse manager.
    pub podverse_manager: Arc<PodverseManager>,
}

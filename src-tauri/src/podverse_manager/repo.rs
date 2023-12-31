//! I provide repo implementation for the recipe.
//!

use manas_repo_opendal::object_store::backend::impl_::fs::FsBackend;
use manas_server::{
    pep::RcpTrivialPEP,
    repo::{RcpRdfSourceCNL, RcpRepo},
};

/// Type of the conneg layer for the recipe.
pub type LRcpCNL = RcpRdfSourceCNL<FsBackend>;

/// Type of the policy enforcement point for the recipe.
pub type LRcpPEP = RcpTrivialPEP;

/// Type of the repo used for the recipe.
pub type LRcpRepo = RcpRepo<FsBackend, LRcpCNL, LRcpPEP>;

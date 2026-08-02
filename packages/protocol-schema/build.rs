use std::process::Command;
use std::path::Path;

fn main() {
    println!("cargo:rerun-if-changed=fbs/market_data.fbs");
    println!("cargo:rerun-if-changed=fbs/indicator_payload.fbs");
    println!("cargo:rerun-if-changed=fbs/rpc_messages.fbs");

    // Create directories if they don't exist
    std::fs::create_dir_all("src").unwrap();
    std::fs::create_dir_all("../plugin-sdk/python/nexusquant_sdk/protocol").unwrap();
    std::fs::create_dir_all("../plugin-sdk/typescript/src/protocol").unwrap();

    // Compile Rust bindings
    let status_rust = Command::new("flatc")
        .args(&[
            "--rust",
            "-o",
            "src/",
            "fbs/market_data.fbs",
            "fbs/indicator_payload.fbs",
            "fbs/rpc_messages.fbs",
        ])
        .status();

    if let Err(e) = status_rust {
        println!("cargo:warning=Failed to run flatc for Rust bindings: {}", e);
    }

    // Compile Python bindings
    let status_py = Command::new("flatc")
        .args(&[
            "--python",
            "-o",
            "../plugin-sdk/python/",
            "fbs/market_data.fbs",
            "fbs/indicator_payload.fbs",
            "fbs/rpc_messages.fbs",
        ])
        .status();

    if let Err(e) = status_py {
        println!("cargo:warning=Failed to run flatc for Python bindings: {}", e);
    }

    // Compile TypeScript bindings
    let status_ts = Command::new("flatc")
        .args(&[
            "--ts",
            "-o",
            "../plugin-sdk/typescript/src/protocol/",
            "fbs/market_data.fbs",
            "fbs/indicator_payload.fbs",
            "fbs/rpc_messages.fbs",
        ])
        .status();

    if let Err(e) = status_ts {
        println!("cargo:warning=Failed to run flatc for TypeScript bindings: {}", e);
    }
}

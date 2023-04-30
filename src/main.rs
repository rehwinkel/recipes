use std::{net::SocketAddr, sync::Arc};

use clap::Parser;
use diesel::{Connection, SqliteConnection};
use tokio::sync::Mutex;

mod model;
mod rest;
mod schema;

#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    #[arg(short, long, default_value = "recipes.sqlite")]
    db_file: String,
    #[arg(long, default_value = "127.0.0.1")]
    host: String,
    #[arg(short, long, default_value_t = 8080)]
    port: u16,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();

    let addr_string = format!("{}:{}", args.host, args.port);
    let addr: SocketAddr = addr_string
        .parse()
        .unwrap_or_else(|e| panic!("Invalid address '{}': {}", addr_string, e));

    let db_url = format!("file:{}", args.db_file);

    let conn = Arc::new(Mutex::new(
        SqliteConnection::establish(&db_url).expect("Failed to open SQL database"),
    ));

    rest::run_server(addr, conn).await;
}

use std::{net::SocketAddr, path::Path, sync::Arc};

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
    #[arg(short, long, default_value = "./images")]
    images_dir: String,
    #[arg(long, default_value = "127.0.0.1")]
    host: String,
    #[arg(short, long, default_value_t = 8080)]
    port: u16,
}

fn setup_logger() {
    fern::Dispatch::new()
        .format(|out, message, record| {
            out.finish(format_args!(
                "[{} {} {}] {}",
                humantime::format_rfc3339_seconds(std::time::SystemTime::now()),
                record.level(),
                record.target(),
                message
            ))
        })
        .level(log::LevelFilter::Debug)
        .level_for("hyper", log::LevelFilter::Info)
        .chain(std::io::stdout())
        .apply()
        .unwrap();
}

#[tokio::main]
async fn main() {
    setup_logger();

    let args = Args::parse();

    let addr_string = format!("{}:{}", args.host, args.port);
    let addr: SocketAddr = addr_string
        .parse()
        .unwrap_or_else(|e| panic!("Invalid address '{}': {}", addr_string, e));

    let db_url = format!("file:{}", args.db_file);
    log::info!("Connecting to DB url '{}'", &db_url);

    let conn = Arc::new(Mutex::new(
        SqliteConnection::establish(&db_url).expect("Failed to open SQL database"),
    ));

    rest::run_server(addr, conn, &Path::new(&args.images_dir)).await;
}

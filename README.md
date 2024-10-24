# safe-co-signer

## Overview

`safe-co-signer` is a project designed to provide a secure and efficient way to manage co-signing operations for [Safe{Wallet}](https://safe.global/).  
This repository includes basic Whitelist functionality and necessary configurations to get started quickly.  
Supposed to run as a cron job task or cli tool.

## Features

- Secure co-signing operations
- Easy to configure and extend
- Lightweight and fast

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- pnpm (version 6 or higher)

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/akme/safe-co-signer.git
    cd safe-co-signer
    ```

2. Install dependencies:
    ```sh
    pnpm install
    ```

3. Copy the example environment file and configure it:
    ```sh
    cp .env.example .env.local
    ```

4. Update `.env.local` with your configuration.

### Usage

To start the application, run:
```sh
node --no-deprecation --env-file=.env.local index.js
```
To prettify logs, add:
```sh
| npx pino-pretty
```
### Running as a Cron Job

To run the application as a cron job, follow these steps:

1. Open your crontab file for editing:
    ```sh
    crontab -e
    ```

2. Add a new cron job entry. For example, to run the application every 10 minutes, add the following line:
    ```sh
    */10 * * * * cd /path/to/your/project && node --no-deprecation --env-file=.env.local index.js 2>&1 >> /path/to/your/project/actions.log
    ```

    Replace `/path/to/your/project` with the actual path to your project directory.

3. Save and close the crontab file.
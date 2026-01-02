# Smart Calendar Tracker

## Project info

A recurring task calendar with status tracking and export capabilities.

## Setup Instructions

1.  **Install Dependencies**:
    ```sh
    yarn install
    ```

2.  **Supabase Setup**:
    - Create a new project on [Supabase](https://supabase.com).
    - Copy the `Project URL` and `Anon Key` into your `.env` file.
    - **Database Migration (Fix)**:
      - Go to the SQL Editor in your Supabase Dashboard.
      - **Run the content of `supabase/migrations/20260102014557_fix_complete_schema.sql`**.
      - This single file sets up the entire database structure (Base tables + Status/Remarks features).

3.  **Start Development**:
    ```sh
    yarn run dev
    ```

## Features

- **Recurring Entries**: Daily, Weekly, Fortnightly, Monthly, etc.
- **Status Tracking**: Mark tasks as Completed/Incomplete with remarks for specific dates.
- **Advanced Export**:
    - **Register Format**: Date-wise list of all tasks.
    - **Schedule Format**: Equipment-wise list with "Last Done" and "Next Due" dates.
    - Formats: PDF, Excel, CSV.

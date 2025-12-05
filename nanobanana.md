    # Bulk Image Edit Generation using Nano Banana and whisk

    This document explains how to use **Nano Banana and whisk** to generate multiple edited images automatically using a CSV file.

    ---

    ## How It Works

    Nano Banana and whisk can process many images at once by reading a **CSV file** where each row contains:

    - **name** — the final filename you want for the generated image  
    - **prompt** — the instruction used to generate or edit that image  

    After processing each row, the app will:
    1. Use the prompt to generate the image.
    2. Automatically download the result.
    3. Save the file using the **name** you provided (e.g., `1.jpg`, `myimage01.jpg`).
    4. Always use .jpg file
    ---

    ## CSV Format

    Your CSV file must follow this structure:

    ```
    name,prompt
    1,"make a dragon using this image"
    ```

    ---

    ## Example Workflow

    ### CSV Input
    ```
    name,prompt
    1,"Add traits on this image and make the image as base image"
    ```

    ### App Behavior
    - Generates the image using the prompt: **"make a dragon using this image"**
    - Downloads the generated file
    - Automatically renames it to **1.jpg**

    ---

    ## Summary

    By preparing a simple CSV file, you can:
    - Generate large batches of images
    - Apply different prompts to each image
    - Automatically rename each generated result according to the CSV

    This makes bulk editing fast, organized, and efficient.

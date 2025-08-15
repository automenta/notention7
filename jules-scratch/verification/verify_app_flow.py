import asyncio
from playwright.sync_api import sync_playwright, expect

def handle_console(msg):
    """Prints console messages from the browser."""
    # Ignore the benign "Download the React DevTools" message
    if "Download the React DevTools" in msg.text:
        return
    print(f"BROWSER CONSOLE: [{msg.type}] {msg.text}")

def verify_app_flow(page):
    """
    This script verifies the core user flow of creating a note,
    adding text, a tag, and a property.
    """
    # Listen for console messages to debug app initialization
    page.on('console', handle_console)

    print("Navigating to the app...")
    page.goto("http://localhost:5173/")

    # Wait for localforage to be ready, then clear it to ensure a clean state.
    print("Waiting for storage to be ready...")
    page.wait_for_function("!!window.localforage", timeout=5000)
    print("Clearing storage and reloading...")
    page.evaluate("window.localforage.clear()")
    page.reload()

    # Wait for the app to finish its initial loading sequence.
    # We know it's ready when the sidebar displays "No notes found."
    print("Waiting for app to initialize...")
    expect(page.get_by_text("No notes found.")).to_be_visible(timeout=10000)
    print("App loaded.")

    # 1. Create a new note
    print("Creating a new note...")
    new_note_button = page.get_by_title("Create new note")
    expect(new_note_button).to_be_visible()
    new_note_button.click()

    # 2. Add content to the note
    print("Adding content to the note...")
    editor = page.locator('.ProseMirror[contenteditable="true"]')
    expect(editor).to_be_visible()

    page.wait_for_timeout(500)

    editor.fill("This is a test note for verification. ")

    # 3. Add a tag
    print("Adding a tag...")
    editor.type("#testing ")
    tag_widget = page.locator('span[data-tag="testing"]')
    expect(tag_widget).to_be_visible()
    expect(tag_widget).to_have_text("#testing")

    # 4. Add a property
    print("Adding a property...")
    editor.type("[status:is:in-progress] ")
    property_widget = page.locator('span[data-widget="semantic-property"][data-property="status"]')
    expect(property_widget).to_be_visible()
    expect(property_widget).to_have_text("status is in-progress")

    # 5. Take a screenshot
    print("Taking screenshot...")
    page.screenshot(path="jules-scratch/verification/verification.png")
    print("Screenshot saved to jules-scratch/verification/verification.png")


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        verify_app_flow(page)
    finally:
        browser.close()

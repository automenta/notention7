import re
from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        setup_test_environment(page)
        test_discovery_feature(page)
        print("Verification script completed successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        browser.close()

def setup_test_environment(page: Page):
    """Sets up the initial state with a Nostr key."""
    page.goto("http://localhost:5173/")

    # Go to settings
    page.get_by_role("button", name="Settings").click()

    # Go to Nostr tab
    page.get_by_role("button", name="🔑 Nostr").click()

    # Check if a key already exists by looking for the logout button
    logout_button = page.get_by_role("button", name="Log Out & Clear Private Key")
    if logout_button.is_visible():
        page.once("dialog", lambda dialog: dialog.accept())
        logout_button.click()

    # Generate a new key
    page.get_by_role("button", name="Generate New Keys").click()

    # Verify that the new public key is displayed
    expect(page.get_by_text("Public Key (npub)")).to_be_visible()

    # Navigate back to the main view
    page.get_by_role("button", name="Notes").click()
    expect(page.get_by_role("heading", name="No Note Selected")).to_be_visible()

def test_discovery_feature(page: Page):
    """
    Tests the full flow of creating, publishing, and discovering a note.
    """
    # 1. Create and publish the "Provider" note
    create_note(page, "Provider Note", "[service:is:Web Design]")
    page.get_by_role("button", name="Publish").click()
    # Handle the alert dialog
    page.once("dialog", lambda dialog: dialog.accept())
    expect(page.get_by_role("button", name="Publishing...")).to_be_visible(timeout=1000)
    expect(page.get_by_role("button", name="Publish")).to_be_visible(timeout=5000)

    # 2. Create the "Seeker" note
    create_note(page, "Seeker Note", "[looking-for:is:Web Design]")

    # 3. Go to Discovery view
    page.get_by_role("button", name="Discovery").click()
    expect(page.get_by_role("heading", name="Discovery")).to_be_visible()

    # 4. Select the "Seeker" note to start the search
    page.get_by_role("heading", name="Seeker Note").click()

    # 5. Verify the results
    expect(page.get_by_text(re.compile("Finding notes related to"))).to_be_visible()

    # Wait for the search to complete
    expect(page.get_by_text("Searching the network...")).not_to_be_visible(timeout=10000)

    # Check that one result was found
    expect(page.get_by_role("heading", name="Found 1 matching note(s)")).to_be_visible()

    # Check that the result card has the correct content preview
    result_card = page.locator(".space-y-4 > div").first
    expect(result_card).to_contain_text("Web Design")

    # 6. Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")


def create_note(page: Page, title: str, content: str):
    """Helper function to create a new note."""
    page.get_by_role("button", name="New Note").click()

    # The editor is tricky. We'll find the contentEditable div and fill it.
    editor_div = page.locator(".ProseMirror")

    # Fill title
    page.get_by_placeholder("Note Title").fill(title)

    # Fill content
    editor_div.type(content)

    # Wait for auto-save to complete (no explicit save button)
    page.wait_for_timeout(2000) # Give it a moment to process and save


if __name__ == "__main__":
    with sync_playwright() as p:
        run(p)

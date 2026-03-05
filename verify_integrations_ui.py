from playwright.sync_api import sync_playwright
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width': 1280, 'height': 800})
    page = context.new_page()
    try:
        # Navigate to Login
        print("Navigating to login...")
        page.goto("http://localhost:3000/login", timeout=30000)

        # Login
        print("Logging in...")
        # Use more generic selectors based on type
        page.fill("input[type='text']", "testuser")
        page.fill("input[type='password']", "password123")
        page.click("button[type='submit']")

        # Wait for Task Manager to load (look for "Mis Tareas" or "Nueva Tarea")
        print("Waiting for dashboard...")
        # Check for multiple possible selectors just in case
        page.wait_for_selector(".task-manager", timeout=15000)

        # Wait a bit for animations
        time.sleep(2)

        # Click Settings Button
        print("Clicking Settings...")
        page.click(".btn-settings")

        # Wait for Integration Manager
        print("Waiting for Integration Manager...")
        page.wait_for_selector(".integration-manager", timeout=10000)

        # Take screenshot of the settings drawer specifically if possible, or full page
        print("Taking screenshot...")
        page.screenshot(path="integration_settings.png", full_page=True)
        print("Screenshot saved to integration_settings.png")

        # Verify specific elements exist
        # We look for the service icons inside .integration-manager
        assert page.locator(".service-icon.google").count() > 0, "Google icon not visible"
        assert page.locator(".service-icon.apple").count() > 0, "Apple icon not visible"
        assert page.locator(".service-icon.notion").count() > 0, "Notion icon not visible"

        print("Verification successful: All integration icons visible.")

    except Exception as e:
        print(f"Error: {e}")
        # Try to take screenshot anyway if possible
        try:
            page.screenshot(path="error_screenshot.png")
            print("Saved error_screenshot.png")
        except:
            pass
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)

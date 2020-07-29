module.exports = {
    name: 'Example',
    params: {},
    tests: [
        {
            description: 'Connect message should be visible when no Trezor is connected.',
            run: async (browser, page) => {
                // Wait for iframe to load
                await page.waitFor(5000);
                // Click on the action button (will open the pop up)
                await page.click('#btn');
                // Wait for the pop up
                await page.waitFor(3000);
                // Get the popup
                const pages = await browser.pages();
                const popup = pages[pages.length - 1];
                // Check the right text is here
                const connect = await popup.$('.connect > p');
                const text = await popup.evaluate(element => element.textContent, connect);
                expect(text).toBe('Connect Trezor to continue');
            },
        },
    ],
};

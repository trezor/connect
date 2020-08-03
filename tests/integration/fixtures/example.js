module.exports = {
    name: 'Example',
    params: {},
    tests: [
        {
            description: 'Full flow for getting address should work.',
            run: async (browser, page, controller) => {
                // Wait for iframe to load
                await page.waitFor(5000);
                // Click on the action button (will open the pop up)
                await page.click('#btn');
                // Wait for the pop up
                await page.waitFor(3000);
                // Get the popup
                const pages = await browser.pages();
                const popup = pages[pages.length - 1];
                // Leave it time to initialize
                await page.waitFor(5000);
                // Allow
                await popup.waitForSelector('.permissions > .buttons > .confirm');
                await popup.click('.permissions > .buttons > .confirm');
                // Export
                await popup.waitForSelector('.export-address > .buttons > .confirm');
                await popup.click('.export-address > .buttons > .confirm');
                // Get address here
                // Accept device input
                await controller.send({ type: 'emulator-decision' });

                await page.waitFor(2000);
                /*
                const connect = await popup.$('.connect > p');
                const text = await popup.evaluate(element => element.textContent, connect);
                */
                // expect(text).toBe('Connect Trezor to continue');
            },
        },
    ],
};

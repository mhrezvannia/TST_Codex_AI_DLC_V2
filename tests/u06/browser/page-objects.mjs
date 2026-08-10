export class SignedWaveAFixture { constructor(page) { this.page = page; } async assertEdgeOnly() { return this.page.url().startsWith("http://127.0.0.1:18088/"); } }
class BasePage { constructor(page) { this.page = page; } async open(route) { await this.page.goto(`http://127.0.0.1:18088${route}`); } }
export class ChargeAgreementsPageObject extends BasePage { async openList() { return this.open("/charge-agreements"); } async create() { return this.page.getByRole("link", { name: /new agreement/i }).click(); } }
export class ChargeRatesPageObject extends BasePage { async openList() { return this.open("/charge-agreements/rates"); } }
export class ManualPricingPageObject extends BasePage { async open() { return super.open("/charge-agreements/manual-pricing"); } }
export class BookingPricingRegionObject extends BasePage { async price() { return this.page.getByRole("button", { name: /^price$/i }).click(); } async reprice() { return this.page.getByRole("button", { name: /reprice/i }).click(); } }

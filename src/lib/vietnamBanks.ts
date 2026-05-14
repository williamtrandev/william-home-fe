export interface VietnamBank {
    code: string;
    shortName: string;
    name: string;
}

export const VIETNAM_BANKS: VietnamBank[] = [
    { code: "VCB", shortName: "Vietcombank", name: "Joint Stock Commercial Bank for Foreign Trade of Vietnam" },
    { code: "TCB", shortName: "Techcombank", name: "Vietnam Technological and Commercial Joint Stock Bank" },
    { code: "BIDV", shortName: "BIDV", name: "Joint Stock Commercial Bank for Investment and Development of Vietnam" },
    { code: "CTG", shortName: "VietinBank", name: "Vietnam Joint Stock Commercial Bank for Industry and Trade" },
    { code: "MB", shortName: "MB Bank", name: "Military Commercial Joint Stock Bank" },
    { code: "ACB", shortName: "ACB", name: "Asia Commercial Joint Stock Bank" },
    { code: "VPB", shortName: "VPBank", name: "Vietnam Prosperity Joint Stock Commercial Bank" },
    { code: "TPB", shortName: "TPBank", name: "Tien Phong Commercial Joint Stock Bank" },
    { code: "STB", shortName: "Sacombank", name: "Saigon Thuong Tin Commercial Joint Stock Bank" },
    { code: "HDB", shortName: "HDBank", name: "Ho Chi Minh City Development Joint Stock Commercial Bank" },
    { code: "VIB", shortName: "VIB", name: "Vietnam International Commercial Joint Stock Bank" },
    { code: "SHB", shortName: "SHB", name: "Saigon Hanoi Commercial Joint Stock Bank" },
    { code: "MSB", shortName: "MSB", name: "Vietnam Maritime Commercial Joint Stock Bank" },
    { code: "OCB", shortName: "OCB", name: "Orient Commercial Joint Stock Bank" },
    { code: "SSB", shortName: "SeABank", name: "Southeast Asia Commercial Joint Stock Bank" },
    { code: "EIB", shortName: "Eximbank", name: "Vietnam Export Import Commercial Joint Stock Bank" },
    { code: "LPB", shortName: "LPBank", name: "Lien Viet Post Commercial Joint Stock Bank" },
    { code: "AGR", shortName: "Agribank", name: "Vietnam Bank for Agriculture and Rural Development" },
    { code: "NAB", shortName: "Nam A Bank", name: "Nam A Commercial Joint Stock Bank" },
    { code: "ABB", shortName: "ABBank", name: "An Binh Commercial Joint Stock Bank" },
    { code: "PVC", shortName: "PVcomBank", name: "Vietnam Public Joint Stock Commercial Bank" },
    { code: "BAB", shortName: "Bac A Bank", name: "Bac A Commercial Joint Stock Bank" },
    { code: "BVB", shortName: "BaoViet Bank", name: "Bao Viet Joint Stock Commercial Bank" },
    { code: "KLB", shortName: "KienlongBank", name: "Kien Long Commercial Joint Stock Bank" },
    { code: "SGB", shortName: "Saigonbank", name: "Saigon Bank for Industry and Trade" },
];

export const getVietnamBankByCode = (code: string) =>
    VIETNAM_BANKS.find((bank) => bank.code === code);

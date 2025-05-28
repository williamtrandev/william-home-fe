import axiosInstance from "@/lib/axios";

export interface Member {
    id: string;
    name: string;
    email: string;
    picture?: string;
    role: "OWNER" | "MEMBER";
    joinedAt: string;
}

export interface HouseMembersResponse {
    houseId: string;
    houseName: string;
    members: Member[];
}

export interface InviteMemberDto {
    email: string;
    houseId: string;
}

class HouseService {
    private readonly HOUSE_ID = "6834a4135d5b4d1a5a661152";

    async getMembers(): Promise<HouseMembersResponse> {
        const response = await axiosInstance.get<HouseMembersResponse>(
            `/api/houses/${this.HOUSE_ID}/members`
        );
        return response.data;
    }

    async inviteMember(data: InviteMemberDto): Promise<void> {
        await axiosInstance.post("/api/auth/invite", data);
    }

    getHouseId(): string {
        return this.HOUSE_ID;
    }
}

export const houseService = new HouseService();

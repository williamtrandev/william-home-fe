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
    /** Recipient/UI language used to localize the invitation email. */
    language?: "en" | "vi";
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

    /**
     * Remove a member from the house. Backend enforces:
     *  - caller must be OWNER
     *  - cannot remove self
     *  - cannot remove another OWNER
     * The UI should hide the action when those rules apply, but we still
     * surface backend errors verbatim if they slip through.
     */
    async removeMember(memberId: string): Promise<void> {
        await axiosInstance.delete(
            `/api/houses/${this.HOUSE_ID}/members/${memberId}`
        );
    }

    getHouseId(): string {
        return this.HOUSE_ID;
    }
}

export const houseService = new HouseService();

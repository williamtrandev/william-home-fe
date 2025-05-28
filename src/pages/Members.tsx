import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Send, UserPlus, Mail, Users } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { houseService, type Member } from "@/services/house.service";

const Members = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            setIsLoadingMembers(true);
            const response = await houseService.getMembers();
            setMembers(response.members);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error?.[t("language")] ||
                t("membersFetchFailed");
            toast.error(errorMessage);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    const handleSendInvitation = async () => {
        if (!email) {
            toast.error(t("emailRequired"));
            return;
        }

        try {
            setIsLoading(true);
            await houseService.inviteMember({
                email,
                houseId: houseService.getHouseId(),
            });
            toast.success(t("invitationSent"));
            setEmail("");
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error?.[t("language")] ||
                t("invitationFailed");
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleBadge = (role: string) => {
        const isOwner = role === "OWNER";
        return (
            <Badge
                variant={isOwner ? "default" : "secondary"}
                className={cn(
                    "capitalize",
                    isOwner
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-muted"
                )}
            >
                {t(role.toLowerCase())}
            </Badge>
        );
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {t("manageMembers")}
                    </h1>
                    <p className="text-muted-foreground">
                        {t("membersDescription")}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">
                        {members.length} {t("members")}
                    </span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Member List */}
                <Card className="shadow-lg">
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" />
                            {t("currentMembers")}
                        </CardTitle>
                        <CardDescription>
                            {t("membersDescription")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoadingMembers ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("member")}</TableHead>
                                        <TableHead className="text-right">
                                            {t("role")}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.map((member) => (
                                        <TableRow key={member.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage
                                                            className="rounded-full object-cover"
                                                            src={member.picture}
                                                        />
                                                        <AvatarFallback>
                                                            {member.name.charAt(
                                                                0
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">
                                                            {member.name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {member.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {getRoleBadge(member.role)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Invite New Member */}
                <Card className="shadow-lg">
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary" />
                            {t("inviteNewMember")}
                        </CardTitle>
                        <CardDescription>
                            {t("inviteDescription")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    {t("inviteByEmail")}
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        type="email"
                                        placeholder={t("enterEmail")}
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={handleSendInvitation}
                                        disabled={isLoading}
                                        className="min-w-[120px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                {t("send")}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Members;

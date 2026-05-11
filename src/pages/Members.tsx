import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Search, UserPlus, Mail, Shield, Crown, UserX } from "lucide-react";
import { toast } from "sonner";
import { houseService, type Member } from "@/services/house.service";
import { useLocation } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const Members = () => {
    const { t, language } = useLanguage();
    const { theme } = useTheme();
    const { user: authUser } = useAuth();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
    const [isRemoving, setIsRemoving] = useState(false);

    const isOwner = authUser?.currentHouseRole === "OWNER";

    /** Show the remove control only when the current user can actually remove the target. */
    const canRemoveMember = (member: Member) =>
        isOwner &&
        member.role !== "OWNER" &&
        member.id !== authUser?.id;

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;

        try {
            setIsRemoving(true);
            await houseService.removeMember(memberToRemove.id);
            setMembers((prev) =>
                prev.filter((m) => m.id !== memberToRemove.id)
            );
            toast.success(t("removeMemberSuccess"));
            setMemberToRemove(null);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error?.[language] ||
                t("removeMemberFailed");
            toast.error(errorMessage);
        } finally {
            setIsRemoving(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const response = await houseService.getMembers();
            setMembers(response.members);
        } catch (error) {
            console.error("Error fetching members:", error);
            toast.error(t("membersFetchFailed"));
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail) {
            toast.error(t("emailRequired"));
            return;
        }

        try {
            setIsInviting(true);
            await houseService.inviteMember({
                email: inviteEmail,
                houseId: houseService.getHouseId(),
                language,
            });
            toast.success(t("invitationSent"));
            setInviteEmail("");
            setShowInviteDialog(false);
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.error?.[t("language")] ||
                t("invitationFailed");
            toast.error(errorMessage);
        } finally {
            setIsInviting(false);
        }
    };

    const filteredMembers = members.filter(
        (member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="grid gap-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {t("members")}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t("memberDetails")}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder={t("searchMembers")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full sm:w-[300px]"
                        />
                    </div>
                    <Button
                        onClick={() => setShowInviteDialog(true)}
                        className="w-full sm:w-auto"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {t("inviteMember")}
                    </Button>
                </div>
            </div>

            {/* Desktop Table View */}
            {!isMobile && (
                <Card className="border border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            {t("memberList")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                            {t("member")}
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                            {t("email")}
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                            {t("role")}
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                                            {t("joinedAt")}
                                        </th>
                                        {isOwner && (
                                            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground w-24">
                                                {t("actions")}
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.map((member) => (
                                        <tr
                                            key={member.id}
                                            className="border-b border-border/50 hover:bg-background/50 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage
                                                            src={member.picture}
                                                            alt={member.name}
                                                            className="object-cover"
                                                        />
                                                        <AvatarFallback>
                                                            {member.name.charAt(
                                                                0
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">
                                                        {member.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="w-4 h-4" />
                                                    {member.email}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge
                                                    variant={
                                                        member.role === "OWNER"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                    className="capitalize"
                                                >
                                                    {member.role === "OWNER" ? (
                                                        <div className="flex items-center gap-1">
                                                            <Crown className="w-3 h-3" />
                                                            {t("owner")}
                                                        </div>
                                                    ) : (
                                                        t("member")
                                                    )}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 text-muted-foreground">
                                                {formatDate(member.joinedAt)}
                                            </td>
                                            {isOwner && (
                                                <td className="py-3 px-4 text-right">
                                                    {canRemoveMember(member) ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                setMemberToRemove(
                                                                    member
                                                                )
                                                            }
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                                            aria-label={t(
                                                                "removeMember"
                                                            )}
                                                        >
                                                            <UserX className="w-4 h-4" />
                                                        </Button>
                                                    ) : null}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Mobile Card View */}
            {isMobile && (
                <div className="space-y-4">
                    {filteredMembers.map((member) => (
                        <Card
                            key={member.id}
                            className="border border-border shadow-sm"
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar>
                                        <AvatarImage
                                            src={member.picture}
                                            alt={member.name}
                                            className="object-cover"
                                        />
                                        <AvatarFallback>
                                            {member.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">
                                            {member.name}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="w-3 h-3" />
                                            {member.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <Badge
                                        variant={
                                            member.role === "OWNER"
                                                ? "default"
                                                : "secondary"
                                        }
                                        className="capitalize"
                                    >
                                        {member.role === "OWNER" ? (
                                            <div className="flex items-center gap-1">
                                                <Crown className="w-3 h-3" />
                                                {t("owner")}
                                            </div>
                                        ) : (
                                            t("member")
                                        )}
                                    </Badge>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">
                                            {formatDate(member.joinedAt)}
                                        </span>
                                        {canRemoveMember(member) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setMemberToRemove(member)
                                                }
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                                aria-label={t("removeMember")}
                                            >
                                                <UserX className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Invite Dialog */}
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogContent className="w-[280px] sm:w-[400px] mx-auto rounded-lg">
                    <DialogHeader>
                        <DialogTitle>{t("inviteNewMember")}</DialogTitle>
                        <DialogDescription>
                            {t("inviteDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t("inviteByEmail")}
                            </label>
                            <Input
                                type="email"
                                placeholder={t("enterEmail")}
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowInviteDialog(false)}
                                disabled={isInviting}
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                onClick={handleInvite}
                                disabled={isInviting}
                            >
                                {isInviting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        {t("send")}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Remove member confirmation */}
            <AlertDialog
                open={!!memberToRemove}
                onOpenChange={(open) => {
                    if (!open && !isRemoving) setMemberToRemove(null);
                }}
            >
                <AlertDialogContent className="w-[280px] sm:w-[400px] mx-auto rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {t("removeMemberConfirmTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {memberToRemove
                                ? t("removeMemberConfirmDescription").replace(
                                      "{name}",
                                      memberToRemove.name
                                  )
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRemoving}>
                            {t("cancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleRemoveMember();
                            }}
                            disabled={isRemoving}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isRemoving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    {t("removeMember")}
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Members;

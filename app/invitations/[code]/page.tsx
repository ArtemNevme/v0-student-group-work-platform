import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { acceptInvitation } from "@/lib/actions/groups"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { cleanDisplayName } from "@/lib/utils"

export default async function AcceptInvitationPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/invitations/${code}`)
  }

  const { data: invitation, error: inviteError } = await supabase
    .from("invitations")
    .select("*, groups(*)")
    .eq("invite_code", code)
    .maybeSingle()

  if (inviteError || !invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>This invitation link is not valid or has expired.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Group</CardTitle>
          <CardDescription>You&apos;ve been invited to join a group</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-control border border-border bg-surface-2 p-4">
            <h3 className="font-display font-medium tracking-[-0.01em] text-foreground">{cleanDisplayName(invitation.groups.name)}</h3>
            {invitation.groups.description && (
              <p className="mt-1 text-sm text-muted-foreground">{invitation.groups.description}</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-num">
                {invitation.groups.member_count} / {invitation.groups.max_members}
              </span>{" "}
              members
            </p>
          </div>

          {invitation.status === "accepted" ? (
            <div className="rounded-chip border border-success/30 bg-success/10 p-3 text-success">
              <p className="text-sm">You&apos;ve already accepted this invitation</p>
            </div>
          ) : new Date(invitation.expires_at) < new Date() ? (
            <div className="rounded-chip border border-danger/30 bg-danger/10 p-3 text-danger">
              <p className="text-sm">This invitation has expired</p>
            </div>
          ) : invitation.groups.member_count >= invitation.groups.max_members ? (
            <div className="rounded-chip border border-danger/30 bg-danger/10 p-3 text-danger">
              <p className="text-sm">This group is full</p>
            </div>
          ) : (
            <form
              action={async () => {
                "use server"
                const result = await acceptInvitation(code)
                if (result.success) {
                  redirect(`/dashboard/groups/${result.groupId}`)
                }
              }}
            >
              <Button type="submit" className="w-full">
                Accept Invitation
              </Button>
            </form>
          )}

          <Button asChild variant="outline" className="w-full bg-transparent">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

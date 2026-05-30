"use client";

import { useState, useEffect, useMemo } from "react";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Send } from "lucide-react";
import toast from "react-hot-toast";
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminFormSection,
  AdminLoading,
} from "@/components/admin/admin-ui";

export default function NewsletterPage() {
  const supabase = useMemo(() => tryCreateBrowserClient(), []);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const fetchSubscribers = async () => {
      if (!supabase) {
        setSubscriberCount(0);
        setLoading(false);
        return;
      }
      const { count, error } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (!error && count !== null) {
        setSubscriberCount(count);
      }
      setLoading(false);
    };

    fetchSubscribers();
  }, [supabase]);

  const handleSend = async () => {
    if (!subject || !body) {
      toast.error("Please fill in subject and body");
      return;
    }

    setSending(true);
    setTimeout(() => {
      setSending(false);
      setShowDialog(false);
      setSubject("");
      setBody("");
      toast.success("Newsletter sent successfully (simulated - configure Resend for actual sending)");
    }, 1000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        title="Newsletter"
        subtitle="Send email campaigns to subscribers"
        breadcrumb="Marketing"
      />

      <AdminCard padding="lg">
        <AdminCardHeader title="Subscribers" icon={Mail} />
        {loading ? (
          <AdminLoading label="Loading subscribers…" />
        ) : (
          <p className="font-display text-3xl font-bold text-gold-light">
            {subscriberCount}{" "}
            <span className="font-body text-base font-normal text-muted-foreground">
              active subscribers
            </span>
          </p>
        )}
      </AdminCard>

      <AdminCard padding="lg">
        <AdminFormSection
          title="Compose Newsletter"
          description="Draft your campaign message below."
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="font-body">
                Subject
              </Label>
              <Input
                id="subject"
                placeholder="Enter email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="admin-input rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body" className="font-body">
                Body
              </Label>
              <Textarea
                id="body"
                rows={12}
                placeholder="Enter email body..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="rounded-2xl border-border-subtle bg-ocean-deep/50 font-body"
              />
            </div>

            <Button
              onClick={() => setShowDialog(true)}
              disabled={!subject || !body}
              className="admin-btn-primary w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              Send Newsletter
            </Button>
          </div>
        </AdminFormSection>
      </AdminCard>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="border-border-subtle bg-ocean-surface">
          <DialogHeader>
            <DialogTitle className="font-display">Confirm Send</DialogTitle>
          </DialogHeader>
          <p className="font-body text-sm text-muted-foreground">
            Are you sure you want to send this newsletter to {subscriberCount} subscribers?
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" className="admin-btn-outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button className="admin-btn-primary" onClick={handleSend} disabled={sending}>
              {sending ? "Sending…" : "Send Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

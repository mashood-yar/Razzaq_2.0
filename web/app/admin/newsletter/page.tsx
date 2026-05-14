"use client";

import { useState, useEffect, useMemo } from "react";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Send } from "lucide-react";
import toast from "react-hot-toast";

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
    // Skip actual sending since Resend is not configured
    setTimeout(() => {
      setSending(false);
      setShowDialog(false);
      setSubject("");
      setBody("");
      toast.success("Newsletter sent successfully (simulated - configure Resend for actual sending)");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold">Newsletter</h1>
        <p className="text-muted-foreground">Send email campaigns to subscribers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Subscribers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <p className="text-2xl font-bold">{subscriberCount} active subscribers</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compose Newsletter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea
              id="body"
              rows={12}
              placeholder="Enter email body..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <Button
            onClick={() => setShowDialog(true)}
            disabled={!subject || !body}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Newsletter
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Send</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to send this newsletter to {subscriberCount} subscribers?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? "Sending..." : "Send Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

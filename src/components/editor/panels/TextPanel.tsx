"use client";

import React from "react";
import { useEditorStore } from "@/store/editorStore";
import { DISPLAY_FONTS } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlignCenter, AlignLeft, AlignRight, Bold } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#211E1B", "#6B655B", "#C1503F", "#2E3627", "#E8A33D", "#FFFFFF", "#3B4A5A"];

export function TextPanel() {
  const caption = useEditorStore((s) => s.project.caption);
  const setCaption = useEditorStore((s) => s.setCaption);
  const stamps = useEditorStore((s) => s.project.stamps);
  const setStamps = useEditorStore((s) => s.setStamps);
  const commit = useEditorStore((s) => s.commit);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Label>Font</Label>
        <Select value={caption.fontFamily} onValueChange={(v) => { commit(); setCaption({ fontFamily: v }); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {DISPLAY_FONTS.map((f) => (
              <SelectItem key={f.id} value={f.family} style={{ fontFamily: f.family }}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center justify-between">
          <Label>Size</Label>
          <span className="text-xs text-ink-soft">{caption.fontSize}px</span>
        </div>
        <Slider min={14} max={48} value={[caption.fontSize]} onValueChange={([v]) => setCaption({ fontSize: v })} onValueCommit={commit} />

        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              className={cn("size-7 rounded-full border-2 cursor-pointer", caption.color === c ? "border-safelight" : "border-line")}
              style={{ background: c }}
              onClick={() => { commit(); setCaption({ color: c }); }}
              aria-label={c}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={caption.fontWeight >= 700 ? "accent" : "outline"}
            onClick={() => { commit(); setCaption({ fontWeight: caption.fontWeight >= 700 ? 500 : 700 }); }}
          >
            <Bold className="size-4" />
          </Button>
          <Button size="icon" variant={caption.align === "left" ? "accent" : "outline"} onClick={() => { commit(); setCaption({ align: "left" }); }}>
            <AlignLeft className="size-4" />
          </Button>
          <Button size="icon" variant={caption.align === "center" ? "accent" : "outline"} onClick={() => { commit(); setCaption({ align: "center" }); }}>
            <AlignCenter className="size-4" />
          </Button>
          <Button size="icon" variant={caption.align === "right" ? "accent" : "outline"} onClick={() => { commit(); setCaption({ align: "right" }); }}>
            <AlignRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <div className="flex items-center justify-between">
          <Label>Date stamp</Label>
          <Switch checked={stamps.dateStamp} onCheckedChange={(v) => { commit(); setStamps({ dateStamp: v }); }} />
        </div>
        {stamps.dateStamp && (
          <Input
            type="date"
            value={stamps.customDate ?? ""}
            onChange={(e) => setStamps({ customDate: e.target.value })}
          />
        )}

        <div className="flex items-center justify-between">
          <Label>Location stamp</Label>
          <Switch checked={stamps.locationStamp} onCheckedChange={(v) => { commit(); setStamps({ locationStamp: v }); }} />
        </div>
        {stamps.locationStamp && (
          <Input
            placeholder="e.g. Goa, India"
            value={stamps.locationText}
            onChange={(e) => setStamps({ locationText: e.target.value })}
          />
        )}

        <Label>Signature</Label>
        <Input
          placeholder="Add a signature"
          value={stamps.signature}
          onChange={(e) => setStamps({ signature: e.target.value })}
        />
        <Select value={stamps.signatureFont} onValueChange={(v) => setStamps({ signatureFont: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {DISPLAY_FONTS.filter((f) => f.handwriting).map((f) => (
              <SelectItem key={f.id} value={f.family} style={{ fontFamily: f.family }}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

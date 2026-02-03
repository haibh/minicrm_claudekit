"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ContactDecisionMakerFieldsProps {
  isDecisionMaker: boolean;
  authorityLevel: string;
  onDecisionMakerChange: (checked: boolean) => void;
  onAuthorityLevelChange: (value: string) => void;
}

/**
 * Decision-maker checkbox + conditional authority level select.
 * Authority level only shows when isDecisionMaker is true.
 */
export function ContactDecisionMakerFields({
  isDecisionMaker,
  authorityLevel,
  onDecisionMakerChange,
  onAuthorityLevelChange,
}: ContactDecisionMakerFieldsProps) {
  return (
    <>
      <div className="col-span-2 flex items-center space-x-2">
        <Checkbox
          id="isDecisionMaker"
          name="isDecisionMaker"
          checked={isDecisionMaker}
          onCheckedChange={(checked) => onDecisionMakerChange(checked === true)}
          value="true"
        />
        <Label htmlFor="isDecisionMaker" className="cursor-pointer">
          Decision Maker
        </Label>
      </div>

      {isDecisionMaker && (
        <div className="col-span-2">
          <Label htmlFor="authorityLevel">Authority Level</Label>
          <Select
            name="authorityLevel"
            value={authorityLevel}
            onValueChange={onAuthorityLevelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select authority level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary Decision Maker</SelectItem>
              <SelectItem value="secondary">Secondary Decision Maker</SelectItem>
              <SelectItem value="influencer">Influencer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </>
  );
}

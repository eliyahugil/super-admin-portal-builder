
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AddRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoleCreated: (roleName: string) => void;
  loading: boolean;
}

export const AddRoleDialog: React.FC<AddRoleDialogProps> = ({
  open,
  onOpenChange,
  onRoleCreated,
  loading
}) => {
  const { toast } = useToast();
  const [roleName, setRoleName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast({ title: "שם תפקיד ריק", description: "יש להזין שם תפקיד", variant: "destructive" });
      return;
    }
    onRoleCreated(roleName.trim());
    setRoleName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>הוסף תפקיד חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={roleName}
            onChange={e => setRoleName(e.target.value)}
            placeholder="לדוג׳: מלצר, מנהל"
            autoFocus
            required
          />
          <DialogFooter>
            <Button type="submit" disabled={loading || !roleName.trim()}>שמור תפקיד</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

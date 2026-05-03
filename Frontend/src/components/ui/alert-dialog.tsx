import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
};

export const AlertDialogContent = ({ children }: { children?: React.ReactNode }) => {
  return <DialogContent className="sm:max-w-[425px]">{children}</DialogContent>;
};

export const AlertDialogDescription = ({ children }: { children?: React.ReactNode }) => {
  return <DialogDescription className="text-sm text-muted-foreground py-4">{children}</DialogDescription>;
};

export const AlertDialogFooter = ({ children }: { children?: React.ReactNode }) => {
  return <DialogFooter className="flex-row-reverse gap-2 sm:flex-col">{children}</DialogFooter>;
};

export const AlertDialogHeader = ({ children }: { children?: React.ReactNode }) => {
  return <DialogHeader className="pb-2">{children}</DialogHeader>;
};

export const AlertDialogTitle = ({ children }: { children?: React.ReactNode }) => {
  return <DialogTitle className="text-lg font-semibold">{children}</DialogTitle>;
};

export const AlertDialogAction = Button;

export const AlertDialogCancel = ({ onClick, children }: { onClick?: () => void; children?: React.ReactNode }) => {
  return (
    <Button variant="outline" onClick={onClick}>
      {children}
    </Button>
  );
};

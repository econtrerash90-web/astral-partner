import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ICON_OPTIONS = ["✨", "🎂", "💍", "👶", "🎓", "💫", "🌟", "❤️", "🏠", "✈️"];

interface AddDateDialogProps {
  onDateAdded: () => void;
}

const AddDateDialog = ({ onDateAdded }: AddDateDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    event_name: "",
    event_icon: "✨",
    event_date: "",
    event_time: "",
    event_latitude: "",
    event_longitude: "",
  });

  const handleSave = async () => {
    if (!user || !form.event_name || !form.event_date) return;
    setSaving(true);

    const { error } = await supabase.from("important_dates" as any).insert({
      user_id: user.id,
      event_name: form.event_name,
      event_icon: form.event_icon,
      event_date: form.event_date,
      event_time: form.event_time || null,
      event_latitude: form.event_latitude ? parseFloat(form.event_latitude) : null,
      event_longitude: form.event_longitude ? parseFloat(form.event_longitude) : null,
    } as any);

    setSaving(false);
    if (error) {
      toast.error("Error al guardar la fecha");
      return;
    }
    toast.success("Fecha importante agregada");
    setOpen(false);
    setForm({ event_name: "", event_icon: "✨", event_date: "", event_time: "", event_latitude: "", event_longitude: "" });
    onDateAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
          <Plus className="w-4 h-4" /> Agregar fecha
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Nueva fecha importante</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Icono</Label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setForm((f) => ({ ...f, event_icon: icon }))}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                    form.event_icon === icon
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="event_name" className="text-sm text-muted-foreground">Nombre del evento</Label>
            <Input
              id="event_name"
              placeholder="Ej: Mi boda, nacimiento de mi hijo..."
              value={form.event_name}
              onChange={(e) => setForm((f) => ({ ...f, event_name: e.target.value }))}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="event_date" className="text-sm text-muted-foreground">Fecha</Label>
              <Input
                id="event_date"
                type="date"
                value={form.event_date}
                onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="event_time" className="text-sm text-muted-foreground">Hora (opcional)</Label>
              <Input
                id="event_time"
                type="time"
                value={form.event_time}
                onChange={(e) => setForm((f) => ({ ...f, event_time: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="lat" className="text-sm text-muted-foreground">Latitud (opcional)</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                placeholder="Ej: 19.4326"
                value={form.event_latitude}
                onChange={(e) => setForm((f) => ({ ...f, event_latitude: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lng" className="text-sm text-muted-foreground">Longitud (opcional)</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                placeholder="Ej: -99.1332"
                value={form.event_longitude}
                onChange={(e) => setForm((f) => ({ ...f, event_longitude: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving || !form.event_name || !form.event_date} className="w-full btn-gold">
            {saving ? "Guardando..." : "Guardar fecha"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddDateDialog;

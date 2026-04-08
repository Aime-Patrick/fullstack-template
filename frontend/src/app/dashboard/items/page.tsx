"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type Item = {
  id: string;
  name: string;
  description?: string;
};

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const response = await api.get<Item[]>("/items");
      setItems(response.data);
    } catch {
      setError("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchItems();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.patch(`/items/${editingId}`, { name, description });
      } else {
        await api.post("/items", { name, description });
      }
      setName("");
      setDescription("");
      setEditingId(null);
      await fetchItems();
    } catch {
      setError("Failed to save item");
    }
  };

  const onEdit = (item: Item) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description ?? "");
  };

  const onDelete = async (id: string) => {
    setError("");
    try {
      await api.delete(`/items/${id}`);
      await fetchItems();
    } catch {
      setError("Failed to delete item");
    }
  };

  return (
    <section className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit Item" : "Create Item"}
        </h2>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            {editingId ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setName("");
                  setDescription("");
                }}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      </Card>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4">
        {loading ? (
          <p className="text-sm text-zinc-600">Loading items...</p>
        ) : items.length === 0 ? (
          <Card>No items yet.</Card>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="space-y-2">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-zinc-600">{item.description}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(item.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}

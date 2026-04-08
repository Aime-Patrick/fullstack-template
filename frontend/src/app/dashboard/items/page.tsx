"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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

const ITEMS_QUERY_KEY = ["items"];

export default function ItemsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const itemsQuery = useQuery({
    queryKey: ITEMS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.get<Item[]>("/items");
      return response.data;
    },
  });

  const invalidateItems = async () => {
    await queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
  };

  const createItemMutation = useMutation({
    mutationFn: async (payload: { name: string; description: string }) => {
      await api.post("/items", payload);
    },
    onSuccess: invalidateItems,
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { name: string; description: string };
    }) => {
      await api.patch(`/items/${id}`, payload);
    },
    onSuccess: invalidateItems,
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/items/${id}`);
    },
    onSuccess: invalidateItems,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await updateItemMutation.mutateAsync({
          id: editingId,
          payload: { name, description },
        });
      } else {
        await createItemMutation.mutateAsync({ name, description });
      }
      setName("");
      setDescription("");
      setEditingId(null);
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
      await deleteItemMutation.mutateAsync(id);
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
      {itemsQuery.isError ? (
        <p className="text-sm text-red-600">Failed to load items</p>
      ) : null}

      <div className="grid gap-4">
        {itemsQuery.isLoading ? (
          <p className="text-sm text-zinc-600">Loading items...</p>
        ) : !itemsQuery.data || itemsQuery.data.length === 0 ? (
          <Card>No items yet.</Card>
        ) : (
          itemsQuery.data.map((item) => (
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

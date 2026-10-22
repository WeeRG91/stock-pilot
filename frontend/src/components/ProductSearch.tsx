"use client";

import { useState } from "react";

type ProductSearchProps = {
  productNames: string[];
};

export function ProductSearch({ productNames }: ProductSearchProps) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredNames = productNames.filter((name) =>
    name.toLowerCase().includes(normalizedQuery),
  );

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold text-zinc-900">
        Sample product search
      </h2>

      <label
        htmlFor="product-search"
        className="mt-4 block text-sm font-medium text-zinc-700"
      >
        Search products
      </label>

      <input
        id="product-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
        className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900"
      />

      <p className="mt-3 text-sm text-zinc-600" role="status">
        {filteredNames.length} matching products
      </p>

      {filteredNames.length > 0 ? (
        <ul className="mt-3 space-y-2 text-zinc-900">
          {filteredNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-zinc-600">No products match your search.</p>
      )}
    </section>
  );
}
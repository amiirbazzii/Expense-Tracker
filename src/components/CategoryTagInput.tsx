"use client";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from "framer-motion";

interface Props {
  userId: string;
  value: string[];
  onChange: (cats: string[]) => void;
}

export default function CategoryTagInput({ userId, value, onChange }: Props) {
  const [input, setInput] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(input), 200);
    return () => clearTimeout(t);
  }, [input]);

  const suggestions = useQuery(api.functions.categories.getUserCategories, {
    userId: userId as any,
    prefix: debounced,
  });

  const createCategory = useMutation(api.functions.categories.createCategory);

  // helpers
  const canonicalize = (str: string) => str.trim().toLowerCase().replace(/\s+/g, "-");
  const addCategory = async (raw: string) => {
    const cat = canonicalize(raw);
    if (cat === "" || value.includes(cat)) return;
    onChange([...value, cat]);
    setInput("");
    // ensure exists in DB
    if (
      !suggestions?.some((c: { name: string }) => c.name.toLowerCase() === cat) &&
      navigator.onLine
    ) {
      await createCategory({ userId: userId as any, name: cat });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addCategory(input.trim());
    } else if (e.key === "Backspace" && input === "" && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (cat: string) => {
    onChange(value.filter((c) => c !== cat));
  };

  return (
    <div className="w-full">
      <div
        className="flex flex-wrap items-center gap-2 px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((cat) => (
          <motion.span
            key={cat}
            className="flex items-center bg-blue-600 text-white text-sm px-2 py-1 rounded-full"
            layout
          >
            {cat}
            <button
              type="button"
              className="ml-1 text-xs hover:text-gray-200"
              onClick={() => removeTag(cat)}
            >
              ✖
            </button>
          </motion.span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent focus:outline-none text-white min-w-[120px]"
          placeholder={value.length ? "" : "Add category"}
        />
      </div>
      {debounced && suggestions && (
        <ul className="mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-40 overflow-y-auto">
          {suggestions.map((s: {name:string}) => (
            <li
              key={s.name}
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => addCategory(s.name)}
            >
              {s.name}
            </li>
          ))}
          {!suggestions.some((s: {name:string}) => s.name.toLowerCase() === debounced.toLowerCase()) && (
            <li
              className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-blue-400"
              onClick={() => addCategory(debounced)}
            >
              Create "{debounced}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

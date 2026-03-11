import { useEffect, useState } from "react";
import API from "../../api";
import { useDebounce } from "../../hooks/useDebounce";

export default function Autocomplete({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (v: string) => void;
}) {
  const [items, setItems] = useState<string[]>([]);
  const debounced = useDebounce(query, 300);

  useEffect(() => {
    if (!debounced) {
      setItems([]);
      return;
    }

    API.get("/search/jobs/autocomplete", { params: { query: debounced } }).then(
      (res) => {
        setItems(res.data); // now res.data is an array of strings
      },
    );
  }, [debounced]);

  if (!items.length) return null;

  return (
    <div className="list-group position-absolute w-100 shadow z-3">
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          className="list-group-item list-group-item-action"
          onClick={() => onSelect(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

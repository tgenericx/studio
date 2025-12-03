"use client";

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, collection, getDocs } from 'firebase/firestore';

export const useCollection = (query: Query | null) => {
  const [data, setData] = useState<DocumentData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);

    const unsubscribe = onSnapshot(query, 
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query ? query.path : null]); // Re-run effect if query path changes

  return { data, loading, error };
};

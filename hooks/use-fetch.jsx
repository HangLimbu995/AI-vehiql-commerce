const { useState } = require("react");
const { toast } = require("sonner");

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      console.log("args are", args);
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error) {
      console.log("cb error", error);
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;

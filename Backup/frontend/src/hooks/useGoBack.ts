import { useRouter } from "next/navigation";

// Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
const useGoBack = () => {
  const router = useRouter();

  // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
  const goBack = () => {
    // Fungsi ini digunakan untuk menangani proses sesuai nama dan konteks pemanggilannya.
    if (window.history.length > 1) {
      router.back(); // Navigate to the previous route
    } else {
      router.push("/"); // Redirect to home if no history exists
    }
  };

  return goBack;
};

export default useGoBack;

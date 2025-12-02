"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header";
import Link from "next/link";
import Swal from "sweetalert2";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:4000/products"); // Menggunakan endpoint public yang sudah ada
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal memuat produk", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Hapus Produk?",
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:4000/products/${id}`, {
          withCredentials: true,
        });
        Swal.fire("Terhapus!", "Produk berhasil dihapus.", "success");
        fetchProducts(); // Refresh list
      } catch (err) {
        const msg = err.response?.data?.error || "Gagal menghapus produk";
        Swal.fire("Gagal", msg, "error");
      }
    }
  };

  // Logic Pagination Client-Side
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  if (loading)
    return (
      <>
        {" "}
        <Header /> <div className="p-10 pt-[140px] text-center">
          Loading...
        </div>{" "}
      </>
    );

  return (
    <>
      <Header />
      <div className="p-6 pt-[140px] max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2b2b2b]">Kelola Produk</h1>
          <Link
            href="/admin/products/add"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Tambah Produk
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="p-4 border-b">ID</th>
                <th className="p-4 border-b">Gambar</th>
                <th className="p-4 border-b">Nama Produk</th>
                <th className="p-4 border-b">Kategori</th>
                <th className="p-4 border-b">Harga</th>
                <th className="p-4 border-b">Stok</th>
                <th className="p-4 border-b text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 border-b">
                  <td className="p-4">{product.id}</td>
                  <td className="p-4">
                    <img
                      src={product.image || "/next.svg"}
                      alt={product.title}
                      className="w-12 h-12 object-cover rounded bg-gray-100"
                    />
                  </td>
                  <td className="p-4 font-medium">{product.title}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {product.category.replace(/_/g, " ")}
                  </td>
                  <td className="p-4 text-green-600 font-bold">
                    ${product.price}
                  </td>
                  <td className="p-4">{product.stock}</td>
                  <td className="p-4 flex justify-center gap-2">
                    <Link
                      href={`/admin/products/edit/${product.id}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {currentProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-gray-500">
                    Tidak ada produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-4 py-2">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}

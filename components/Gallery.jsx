import React, { useEffect, useState } from "react";
import "./Masonry.css";
import "./Modal.css";

const Masonry = () => {
    const [images, setImages] = useState([]);
    const [allImages, setAllImages] = useState([]); // Almacena todas las imágenes
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null); // Imagen seleccionada
    const [transitioning, setTransitioning] = useState(false); // Control de transición
    const itemsPerPage = 7;

    const fetchImages = async () => {
        setLoading(true);
        const githubApiUrl = `https://api.github.com/repos/primalxaxa/lainwebsite/contents/img`;
        try {
            const response = await fetch(githubApiUrl);
            const data = await response.json();
            setAllImages(data); // Guarda todas las imágenes al cargar
            paginateImages(data, page);
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setLoading(false);
        }
    };

    const paginateImages = (data, currentPage) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedImages = data.slice(startIndex, startIndex + itemsPerPage);
        setImages(paginatedImages);
    };

    const handleImageClick = (imgUrl, imgId) => {
        if (document.startViewTransition) {
            setTransitioning(true);
            document.startViewTransition(() => {
                setSelectedImage({ imgUrl, imgId });
            }).finally(() => setTransitioning(false));
        } else {
            setSelectedImage({ imgUrl, imgId });
        }
    };

    const closeModal = () => {
        if (document.startViewTransition) {
            setTransitioning(true);
            document.startViewTransition(() => {
                setSelectedImage(null);
            }).finally(() => setTransitioning(false));
        } else {
            setSelectedImage(null);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    useEffect(() => {
        paginateImages(allImages, page);
    }, [page]);

    const hasNextPage = () => page * itemsPerPage < allImages.length;

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {/* Paginación */}
                    <div className="pagination">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span>Page {page}</span>
                        <button
                            onClick={() => setPage((prev) => (hasNextPage() ? prev + 1 : prev))}
                            disabled={!hasNextPage()}
                        >
                            Next
                        </button>
                    </div>

                    <div className="masonry">
                        {images.map((img, index) => (
                            <div
                                className={`masonry-item ${transitioning ? "transitioning" : ""}`}
                                key={index}
                                onClick={() => handleImageClick(img.download_url, `image-${index}`)}
                                id={`image-${index}`}
                            >
                                <img src={img.download_url} alt={img.name} />
                            </div>
                        ))}
                    </div>

                    {/* Modal */}
                    {selectedImage && (
                        <div className="modal" onClick={closeModal}>
                            <div
                                className="modal-content"
                                onClick={(e) => e.stopPropagation()}
                                id={selectedImage.imgId}
                            >
                                <img src={selectedImage.imgUrl} alt="Preview" className="preview-image" />
                                <button className="close-btn" onClick={closeModal}>
                                    X
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Masonry;

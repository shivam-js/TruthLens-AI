import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "https://truthlens-ai-production-021a.up.railway.app";

function App() {
  const [claim, setClaim] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("");
  const [newsList, setNewsList] = useState([]);
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [fileText, setFileText] = useState("");
  const [extractedText, setExtractedText] = useState("");

  const fetchNews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news`);
      const data = await response.json();

      if (data.success) {
        setNewsList(data.data);
      }
    } catch (error) {
      console.error("Fetch news error:", error);
    }
  };

  useEffect(() => {
    const loadNews = async () => {
      await fetchNews();
    };
    loadNews();
  }, []);

  const analyzeClaim = async (textToAnalyze) => {
    const finalClaim = String(textToAnalyze || "").trim();

    if (!finalClaim) {
      alert("Please enter a claim");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/news/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ claim: finalClaim }),
    });

    return response.json();
  };

  const handleSubmit = async (customClaim = null) => {
    const finalClaim = String(customClaim || claim || "").trim();

    if (!finalClaim) {
      alert("Please enter a claim");
      return;
    }

    try {
      setLoading(true);
      setPhase("Analyzing claim...");
      setMessage("Analyzing...");

      const data = await analyzeClaim(finalClaim);

      if (data.success) {
        setMessage("Quick AI response ⚡");
        setClaim("");
        await fetchNews();
      } else {
        setMessage(data.message || "Error saving claim ❌");
      }
    } catch (error) {
      console.error("Text analysis error:", error);
      setMessage("Server error ❌");
    } finally {
      setLoading(false);
      setPhase("");
    }
  };

  const handleImageAnalyze = async () => {
    if (!image) {
      alert("Please upload an image first");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      setPhase("Extracting text from image...");
      setMessage("Extracting text from image...");

      const response = await fetch(`${API_BASE_URL}/api/image/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const extracted = data.extractedText || "";
        setExtractedText(extracted);

        if (extracted.trim()) {
          setPhase("Verifying extracted text...");
          const analyzeData = await analyzeClaim(extracted);

          if (analyzeData.success) {
            setMessage("Image analyzed successfully ✅");
            await fetchNews();
          } else {
            setMessage(analyzeData.message || "Image text verification failed ❌");
          }
        } else {
          setMessage("No readable text found in image ❌");
        }
      } else {
        setMessage(data.message || "Image analysis failed ❌");
      }
    } catch (error) {
      console.error("Image analysis error:", error);
      setMessage("Server error during image analysis ❌");
    } finally {
      setLoading(false);
      setPhase("");
    }
  };

  const handleFileAnalyze = async () => {
    if (!file) {
      alert("Please upload a PDF or DOCX file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setPhase("Extracting text from file...");
      setMessage("Extracting text from file...");

      const response = await fetch(`${API_BASE_URL}/api/file/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const extracted = data.extractedText || "";
        setFileText(extracted);

        if (extracted.trim()) {
          setPhase("Verifying extracted file text...");
          const analyzeData = await analyzeClaim(extracted);

          if (analyzeData.success) {
            setMessage("File analyzed successfully ✅");
            await fetchNews();
          } else {
            setMessage(analyzeData.message || "File text verification failed ❌");
          }
        } else {
          setMessage("No readable text found in file ❌");
        }
      } else {
        setMessage(data.message || "File analysis failed ❌");
      }
    } catch (error) {
      console.error("File analysis error:", error);
      setMessage("Server error during file analysis ❌");
    } finally {
      setLoading(false);
      setPhase("");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Claim deleted ✅");
        await fetchNews();
      } else {
        setMessage("Delete failed ❌");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Server error while deleting ❌");
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>TruthLens-AI</h1>
        <h3>Fake News & Misinformation Detector</h3>

        <textarea
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Enter a news claim or statement..."
          rows={4}
          style={{ width: "100%", marginBottom: "10px" }}
        />

        <br />

        <button onClick={() => handleSubmit()} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        <div style={{ marginTop: "20px" }}>
          <h3>Analyze Image / Screenshot</h3>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <br />
          <button onClick={handleImageAnalyze} disabled={loading}>
            {loading ? "Processing..." : "Analyze Image"}
          </button>
        </div>

        <div style={{ marginTop: "20px" }}>
          <h3>Analyze PDF / DOCX</h3>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <br />
          <button onClick={handleFileAnalyze} disabled={loading}>
            {loading ? "Processing..." : "Analyze File"}
          </button>
        </div>

        {fileText && (
          <div className="claim-card">
            <h3>Extracted File Text</h3>
            <p>{fileText.slice(0, 1000)}...</p>
          </div>
        )}

        {extractedText && (
          <div className="claim-card">
            <h3>Extracted Text</h3>
            <p>{extractedText}</p>
          </div>
        )}

        {loading && <p>{phase}</p>}
        <p>{message}</p>

        <h2>Saved Claims</h2>

        {newsList.length === 0 ? (
          <p>No claims saved yet.</p>
        ) : (
          newsList.map((item, index) => {
            const analysisArray = (() => {
              try {
                return JSON.parse(item.explanation);
              } catch {
                return null;
              }
            })();

            return (
              <div key={item._id || index} className="claim-card">
                <h3>Analysis Report</h3>

                <p>
                  <strong>Analyzed Content:</strong> {item.claim}
                </p>

                {Array.isArray(analysisArray) ? (
                  analysisArray.map((claimItem, i) => (
                    <div key={i} className="claim-card">
                      <h4>Claim {i + 1}</h4>

                      <p>
                        <strong>Statement:</strong> {claimItem.claim}
                      </p>

                      <p>
                        <strong>Verdict:</strong>{" "}
                        <span
                          className={`badge ${claimItem.result?.toLowerCase()}`}
                        >
                          {claimItem.result}
                        </span>
                      </p>

                      <p>
                        <strong>Explanation:</strong>{" "}
                        {claimItem.explanation}
                      </p>

                      <p>
                        <strong>Credibility Score:</strong>{" "}
                        {claimItem.credibilityScore ?? "N/A"}/100
                      </p>

                      {claimItem.sources?.length > 0 && (
                        <div>
                          <strong>Sources:</strong>
                          <ul>
                            {claimItem.sources.map((source, sourceIndex) => (
                              <li key={sourceIndex}>
                                <a
                                  href={source}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Source {sourceIndex + 1}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <>
                    <p>
                      <strong>AI Verdict:</strong>{" "}
                      <span className={`badge ${item.result?.toLowerCase()}`}>
                        {item.result}
                      </span>
                    </p>

                    <p>
                      <strong>Explanation:</strong> {item.explanation}
                    </p>

                    <p>
                      <strong>Credibility Score:</strong>{" "}
                      {item.credibilityScore ?? "N/A"}/100
                    </p>
                  </>
                )}

                <button onClick={() => handleDelete(item._id)}>Delete</button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default App;
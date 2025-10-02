import React, { useEffect, useState, useRef } from "react";
import "../assets/Styles/Style.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import 'datatables.net-responsive-dt';
import "datatables.net";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { certificateAPI } from "../api";
import html2pdf from "html2pdf.js";

// Certificate Template Component
const CertificateTemplate = ({ certificateData, isPreview = false, pdfRef = null }) => {
  return (
    <div className="certificate-container" ref={pdfRef}>
      <div className="certificate-border">
        <div className="header">
          <h1>CERTIFICATE</h1>
          <h2>CONTINUING PROFESSIONAL DEVELOPMENT</h2>
        </div>
        
        <div className="certification-text">
          The CPD Certification Service certifies that
        </div>
        
        <div className="recipient-name">
          {certificateData.full_name || "RECIPIENT NAME"}
        </div>
        
        <div className="certification-text">
          the above named has participated in the following CPD activity
        </div>
        
        <div className="activity-details">
          <div className="activity-name">{certificateData.CPD_activity_title || "CPD ACTIVITY TITLE"}</div>
          <div className="activity-code">({certificateData.CPD_activity_code || "CODE"})</div>
        </div>
        
        <div className="provider-info">
          <div className="provider-name">CPD Provider Organisation</div>
          <div className="provider-name">WORLD TESOL ACADEMY</div>
          <div className="provider-code">(014136)</div>
        </div>
        
        <div className="initiative-text">
          An initiative to increase standards of CPD provision to professionals in relevant market sectors
        </div>
        
        <div className="details-grid">
          <div className="detail-item">
            <span className="detail-label">Date of CPD Activity:</span>
            <span>{certificateData.date_of_CPD_activity ? new Date(certificateData.date_of_CPD_activity).toLocaleDateString() : "DATE"}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">No. CPD Hours/Points:</span>
            <span>{certificateData.no_CPD_hours_points || "0"} points</span>
          </div>
        </div>
        
        <div className="cpd-badge">
          CPD CERTIFIED
        </div>
        
        <div className="footer">
          <div className="footer-title">The CPD Certification Service</div>
          <div className="contact-info">
            The Coach House, Ealing Green, London W5 5ER<br />
            Email: info@cpduk.co.uk Web: www.cpduk.co.uk<br />
            Tel: 020 5840-4383 Fax: 020 5879-3991
          </div>
        </div>
        
        <div className="seal">
          CPD CERTIFIED
        </div>
      </div>
    </div>
  );
};

// Certificate PDF Template Generator using HTML2PDF
const CertificatePDFTemplate = {
  generateCertificatePDF: async (certificateData, certificateElement) => {
    try {
      // Options for PDF generation
      const options = {
        margin: 0,
        filename: `CPD_Certificate_${certificateData.full_name?.replace(/\s+/g, '_') || 'certificate'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'landscape' 
        }
      };

      // Generate PDF from HTML element
      const pdfResult = await html2pdf().set(options).from(certificateElement).outputPdf('blob');
      
      const pdfUrl = URL.createObjectURL(pdfResult);
      const fileName = `CPD_Certificate_${certificateData.full_name?.replace(/\s+/g, '_') || 'certificate'}_${certificateData.id || 'cert'}.pdf`;

      return {
        blob: pdfResult,
        url: pdfUrl,
        fileName: fileName
      };
      
    } catch (error) {
      throw new Error('Failed to generate certificate PDF: ' + error.message);
    }
  },

  blobToFile: (blob, fileName) => {
    const file = new File([blob], fileName, { type: blob.type });
    return file;
  }
};

// Certificate Preview Modal
const CertificatePreviewModal = ({ show, onHide, certificateData, onGeneratePDF }) => {
  const certificateRef = useRef(null);
  
  if (!certificateData) return null;
  
  const handleDownloadPDF = async () => {
    if (certificateRef.current) {
      try {
        await onGeneratePDF(certificateData, certificateRef.current);
      } catch (error) {
        console.error('PDF generation failed:', error);
      }
    }
  };
  
  return (
    <Modal show={show} onHide={onHide} size="lg" fullscreen="md-down">
      <Modal.Header closeButton>
        <Modal.Title>Certificate Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <CertificateTemplate 
          certificateData={certificateData} 
          isPreview={true} 
          pdfRef={certificateRef}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button 
          variant="primary"
          onClick={handleDownloadPDF}
        >
          <i className="bi bi-download me-2"></i>
          Download PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Main Certificate List Component
const CertificateList = () => {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const certificateRef = useRef(null);
  
  const [formData, setFormData] = useState({
    full_name: "",
    CPD_activity_title: "",
    CPD_activity_code: "",
    date_of_CPD_activity: "",
    no_CPD_hours_points: "",
    certificate_state: "Generate"
  });

  const debugLog = (message, data = null) => {
    console.log(`[DEBUG] ${message}`, data || '');
    setDebugInfo(prev => `${new Date().toLocaleTimeString()}: ${message}\n${prev}`);
  };

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError("");
      debugLog("Starting to fetch certificates...");
      
      const result = await certificateAPI.getAll();
      debugLog("API response received:", result);
      
      if (result.success) {
        const certificates = result.data.certificates || [];
        debugLog(`Setting data with ${certificates.length} certificates`, certificates);
        setData(certificates);
      } else {
        setError(result.error || "Failed to fetch certificates");
        debugLog("API returned error:", result.error);
      }
    } catch (err) {
      const errorMsg = "Network error occurred while fetching certificates";
      setError(errorMsg);
      debugLog("Fetch error:", err);
      console.error('Fetch certificates error:', err);
    } finally {
      setLoading(false);
      debugLog("Fetch completed, loading set to false");
    }
  };

  useEffect(() => {
    debugLog("Component mounted, starting fetch");
    fetchCertificates();
  }, []);

  const handleGeneratePDF = async (certificateData, element = null) => {
    debugLog("PDF generation triggered for:", certificateData);
    
    try {
      setGeneratingPdf(true);
      
      if (!certificateData) {
        setError("Certificate data not found");
        return;
      }

      debugLog("Generating PDF for:", certificateData);

      // Use the provided element or create a temporary one
      let certificateElement = element;
      if (!certificateElement) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = document.querySelector('.certificate-container').innerHTML;
        certificateElement = tempDiv;
      }

      const pdfResult = await CertificatePDFTemplate.generateCertificatePDF(certificateData, certificateElement);
      debugLog("Certificate PDF generated");
      
      // For manual generation, upload the file
      if (!element) {
        const pdfFile = CertificatePDFTemplate.blobToFile(pdfResult.blob, pdfResult.fileName);
        
        const formData = new FormData();
        formData.append('certificate_file', pdfFile);

        const updateResult = await certificateAPI.markAsGenerated(certificateData.id, formData);
        
        if (updateResult.success) {
          await fetchCertificates();
          debugLog("Certificate generated and uploaded successfully");
        } else {
          throw new Error(updateResult.error || 'Failed to upload certificate');
        }
      }
      
      // Open PDF in new tab
      window.open(pdfResult.url, '_blank');
      debugLog("PDF opened in new tab");

      setError("");
      
    } catch (error) {
      debugLog("PDF generation failed:", error);
      setError("Failed to generate PDF: " + error.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleManualGeneratePDF = async (certificateId) => {
    const certificate = data.find(item => item.id === certificateId);
    if (certificate) {
      await handleGeneratePDF(certificate);
    }
  };

  const handlePreviewPDF = async (certificateId) => {
    debugLog("PDF preview triggered for:", certificateId);
    
    try {
      setGeneratingPdf(true);
      const certificate = data.find(item => item.id === certificateId);
      
      if (!certificate) {
        setError("Certificate not found");
        return;
      }

      debugLog("Generating preview PDF for:", certificate);

      await handleGeneratePDF(certificate);
      debugLog("Preview PDF generated and opened");

      setError(""); 
      
    } catch (error) {
      debugLog("PDF preview failed:", error);
      setError("Failed to generate preview: " + error.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handlePreviewCertificate = (certificateId) => {
    const certificate = data.find(item => item.id === certificateId);
    if (certificate) {
      setPreviewCertificate(certificate);
      setShowPreviewModal(true);
    }
  };

  useEffect(() => {
    if (data.length > 0 && !loading) {
      debugLog("Initializing DataTable with data:", data);
      
      if ($.fn.DataTable.isDataTable('#certificateTable')) {
        debugLog("Destroying existing DataTable");
        $('#certificateTable').DataTable().destroy();
      }

      try {
        const table = $("#certificateTable").DataTable({
          data: data,
          columns: [
            { title: "ID", data: "id" },
            { title: "Full Name", data: "full_name" },
            { title: "CPD Activity Title", data: "CPD_activity_title" },
            { title: "CPD Activity Code", data: "CPD_activity_code" },
            { 
              title: "Activity Date", 
              data: "date_of_CPD_activity",
              render: function (data) {
                return data ? new Date(data).toLocaleDateString() : 'N/A';
              }
            },
            { title: "CPD Hours/Points", data: "no_CPD_hours_points" },
            { 
              title: "Status", 
              data: "certificate_state",
              render: function (data) {
                const badgeClass = data === 'Generated' ? 'bg-success' : 
                                 data === 'Regenerate' ? 'bg-warning' : 'bg-secondary';
                return `<span class="badge ${badgeClass}">${data}</span>`;
              }
            },
            {
              title: "Certificate",
              data: "certificate_url",
              render: function (data, type, row) {
                if (data && row.certificate_state === 'Generated') {
                  return `
                    <div class="btn-group">
                      <a href="${data}" target="_blank" class="btn btn-sm btn-primary me-1">
                        <i class="bi bi-eye"></i> View
                      </a>
                      <a href="${data}" download class="btn btn-sm btn-success">
                        <i class="bi bi-download"></i> Download
                      </a>
                    </div>
                  `;
                }
                return `
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-info preview-certificate-btn me-1" data-id="${row.id}" title="Preview Certificate">
                      <i class="bi bi-eye"></i> Preview
                    </button>
                    <button class="btn btn-sm btn-outline-primary preview-pdf-btn me-1" data-id="${row.id}" title="Preview PDF">
                      <i class="bi bi-file-pdf"></i> PDF
                    </button>
                    <button class="btn btn-sm btn-warning generate-pdf-btn" data-id="${row.id}" title="Generate Certificate">
                      <i class="bi bi-file-earmark-check"></i> Generate
                    </button>
                  </div>
                `;
              }
            },
            {
              title: "Actions",
              data: null,
              render: function (data, type, row) {
                return `
                  <div class="d-flex justify-content-center">
                    <i class="bi bi-pencil-square edit-icon" data-id="${row.id}" style="cursor: pointer; color: green; margin-right: 15px; font-size: 1.2rem;" title="Edit"></i>
                    <i class="bi bi-trash delete-icon" data-id="${row.id}" style="cursor: pointer; color: red; font-size: 1.2rem;" title="Delete"></i>
                  </div>
                `;
              },
              orderable: false,
              className: "text-center"
            },
          ],
          responsive: true,
          pageLength: 10,
          language: {
            search: "Search certificates:"
          },
          createdRow: function(row, data, dataIndex) {
            $(row).attr('data-certificate-id', data.id);
          }
        });

        debugLog("DataTable initialized successfully");

        $("#certificateTable tbody").on("click", ".edit-icon", function () {
          const id = $(this).data("id");
          debugLog("Edit clicked for ID:", id);
          const rowData = data.find((item) => item.id === id);
          setSelectedId(id);
          setFormData({
            full_name: rowData.full_name || "",
            CPD_activity_title: rowData.CPD_activity_title || "",
            CPD_activity_code: rowData.CPD_activity_code || "",
            date_of_CPD_activity: rowData.date_of_CPD_activity ? rowData.date_of_CPD_activity.split('T')[0] : "",
            no_CPD_hours_points: rowData.no_CPD_hours_points || "",
            certificate_state: rowData.certificate_state || "Generate"
          });
          setEditMode(true);
          setShowModal(true);
        });

        $("#certificateTable tbody").on("click", ".delete-icon", function () {
          const id = $(this).data("id");
          debugLog("Delete clicked for ID:", id);
          setSelectedId(id);
          setEditMode(false);
          setShowModal(true);
        });

        $("#certificateTable tbody").on("click", ".generate-pdf-btn", function () {
          const id = $(this).data("id");
          debugLog("Generate PDF button clicked for:", id);
          handleManualGeneratePDF(id);
        });

        $("#certificateTable tbody").on("click", ".preview-pdf-btn", function () {
          const id = $(this).data("id");
          debugLog("Preview PDF button clicked for:", id);
          handlePreviewPDF(id);
        });

        $("#certificateTable tbody").on("click", ".preview-certificate-btn", function () {
          const id = $(this).data("id");
          debugLog("Preview Certificate button clicked for:", id);
          handlePreviewCertificate(id);
        });

        debugLog("All event handlers attached successfully");

      } catch (error) {
        debugLog("Error initializing DataTable:", error);
        setError("Failed to initialize table: " + error.message);
      }

      return () => {
        if ($.fn.DataTable.isDataTable('#certificateTable')) {
          debugLog("Cleaning up DataTable");
          $('#certificateTable').DataTable().destroy();
        }
      };
    }
  }, [data, loading, generatingPdf]);

  const handleDelete = async () => {
    try {
      debugLog("Deleting certificate:", selectedId);
      const result = await certificateAPI.delete(selectedId);

      if (result.success) {
        await fetchCertificates();
        setShowModal(false);
        setError("");
        debugLog("Certificate deleted successfully");
      } else {
        setError(result.error || "Failed to delete certificate");
        debugLog("Delete failed:", result.error);
      }
    } catch (err) {
      setError("Network error occurred while deleting certificate");
      debugLog("Delete error:", err);
      console.error('Delete certificate error:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    debugLog("Saving certificate data:", formData);
    
    if (!formData.full_name || !formData.CPD_activity_title || !formData.CPD_activity_code || 
        !formData.date_of_CPD_activity || !formData.no_CPD_hours_points) {
      setError("Please fill in all required fields");
      debugLog("Validation failed - missing required fields");
      return;
    }

    try {
      let result;
      
      if (editMode && selectedId) {
        debugLog("Updating existing certificate:", selectedId);
        result = await certificateAPI.update(selectedId, formData);
      } else {
        debugLog("Creating new certificate");
        result = await certificateAPI.create(formData);
      }

      debugLog("Save API response:", result);

      if (result.success) {
        await fetchCertificates();
        setShowModal(false);
        setFormData({
          full_name: "",
          CPD_activity_title: "",
          CPD_activity_code: "",
          date_of_CPD_activity: "",
          no_CPD_hours_points: "",
          certificate_state: "Generate"
        });
        setError("");
        debugLog("Certificate saved successfully");
      } else {
        setError(result.error || `Failed to ${editMode ? 'update' : 'create'} certificate`);
        debugLog("Save failed:", result.error);
      }
    } catch (err) {
      const errorMsg = `Network error occurred while ${editMode ? 'updating' : 'creating'} certificate`;
      setError(errorMsg);
      debugLog("Save error:", err);
      console.error('Save certificate error:', err);
    }
  };

  const handleAddNew = () => {
    debugLog("Adding new certificate");
    setSelectedId(null);
    setFormData({
      full_name: "",
      CPD_activity_title: "",
      CPD_activity_code: "",
      date_of_CPD_activity: "",
      no_CPD_hours_points: "",
      certificate_state: "Generate"
    });
    setEditMode(true);
    setShowModal(true);
    setError("");
  };

  const clearDebugInfo = () => {
    setDebugInfo("");
  };

  if (loading) {
    return (
      <div className="px-3 w-100 d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 w-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4
          className="py-3 fw-bold"
          style={{ color: "#7a70ba", borderBottom: "2px dotted #7a70ba" }}
        >
          CPD Certificates
        </h4>
        <Button
          onClick={handleAddNew}
          style={{ backgroundColor: "#7a70ba", border: "none" }}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add New Certificate
        </Button>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      {generatingPdf && (
        <Alert variant="info" className="d-flex align-items-center">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          Generating certificate PDF...
        </Alert>
      )}

      <div className="table-responsive">
        <table id="certificateTable" className="display table table-striped" style={{ width: '100%' }}></table>
      </div>

      {/* Hidden certificate template for PDF generation */}
      <div style={{ display: 'none' }}>
        <CertificateTemplate 
          certificateData={previewCertificate || formData} 
          pdfRef={certificateRef}
        />
      </div>

      {/* Certificate Preview Modal */}
      <CertificatePreviewModal 
        show={showPreviewModal} 
        onHide={() => setShowPreviewModal(false)} 
        certificateData={previewCertificate}
        onGeneratePDF={handleGeneratePDF}
      />

      {/* Edit/Add/Delete Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editMode ? (selectedId ? "Edit Certificate" : "Add New Certificate") : "Confirm Delete"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editMode ? (
            <Form>
              <Form.Group controlId="formFullName" className="mt-3">
                <Form.Label>Full Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                />
              </Form.Group>
              <Form.Group controlId="formActivityTitle" className="mt-3">
                <Form.Label>CPD Activity Title *</Form.Label>
                <Form.Control
                  type="text"
                  name="CPD_activity_title"
                  value={formData.CPD_activity_title}
                  onChange={handleChange}
                  required
                  placeholder="Enter CPD activity title"
                />
              </Form.Group>
              <Form.Group controlId="formActivityCode" className="mt-3">
                <Form.Label>CPD Activity Code *</Form.Label>
                <Form.Control
                  type="text"
                  name="CPD_activity_code"
                  value={formData.CPD_activity_code}
                  onChange={handleChange}
                  required
                  placeholder="Enter CPD activity code"
                />
              </Form.Group>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group controlId="formActivityDate" className="mt-3">
                    <Form.Label>Activity Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="date_of_CPD_activity"
                      value={formData.date_of_CPD_activity}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group controlId="formCPDHours" className="mt-3">
                    <Form.Label>CPD Hours/Points *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="no_CPD_hours_points"
                      value={formData.no_CPD_hours_points}
                      onChange={handleChange}
                      required
                      placeholder="Enter CPD hours/points"
                      min="0"
                    />
                  </Form.Group>
                </div>
              </div>
              <Form.Group controlId="formCertificateState" className="mt-3">
                <Form.Label>Certificate State</Form.Label>
                <Form.Select
                  name="certificate_state"
                  value={formData.certificate_state}
                  onChange={handleChange}
                >
                  <option value="Generate">Generate</option>
                  <option value="Generated">Generated</option>
                  <option value="Regenerate">Regenerate</option>
                </Form.Select>
              </Form.Group>
            </Form>
          ) : (
            <div className="text-center">
              <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3">Are you sure you want to delete this certificate?</h5>
              <p className="text-muted">This action cannot be undone and will permanently remove the certificate data.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            {editMode ? "Cancel" : "No, Keep It"}
          </Button>
          {editMode ? (
            <Button
              onClick={handleSave}
              style={{ backgroundColor: "#7a70ba", border: "none" }}
              disabled={!formData.full_name || !formData.CPD_activity_title || !formData.CPD_activity_code || !formData.date_of_CPD_activity || !formData.no_CPD_hours_points}
            >
              {selectedId ? "Update" : "Create"} Certificate
            </Button>
          ) : (
            <Button variant="danger" onClick={handleDelete}>
              <i className="bi bi-trash me-2"></i>
              Yes, Delete
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Certificate Template Styles */}
      <style jsx>{`
        .certificate-container {
          width: 100%;
          max-width: 800px;
          background-color: white;
          border: 20px solid #1a3a6c;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          position: relative;
          padding: 40px;
          margin: 0 auto;
        }
        
        .certificate-border {
          border: 2px solid #d4af37;
          padding: 40px 30px;
          position: relative;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 42px;
          color: #1a3a6c;
          letter-spacing: 3px;
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .header h2 {
          font-size: 24px;
          color: #1a3a6c;
          letter-spacing: 2px;
          margin-bottom: 5px;
        }
        
        .certification-text {
          text-align: center;
          margin: 10px 0;
          font-size: 18px;
          line-height: 1;
        }
        
        .recipient-name {
          text-align: center;
          font-size: 32px;
          font-weight: bold;
          margin: 10px 0;
          color: #1a3a6c;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .activity-details {
          margin: 3 0px 0;
          text-align: center;
        }
        
        .activity-name {
          font-size: 24px;
          font-weight: bold;
          color: #1a3a6c;
          margin-bottom: 10px;
        }
        
        .activity-code {
          font-size: 18px;
          margin-bottom: 20px;
        }
        
        .provider-info {
          text-align: center;
          margin: 30px 0;
          font-size: 18px;
        }
        
        .provider-name {
          font-weight: bold;
          font-size: 20px;
          color: #1a3a6c;
          margin-bottom: 5px;
        }
        
        .provider-code {
          font-size: 16px;
          margin-bottom: 20px;
        }
        
        .initiative-text {
          font-style: italic;
          margin: 20px 0;
          text-align: center;
          font-size: 16px;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 30px 0;
          font-size: 18px;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        
        .detail-label {
          font-weight: bold;
        }
        
        .footer {
          text-align: center;
          margin-top: 40px;
          font-size: 16px;
          line-height: 1.5;
        }
        
        .footer-title {
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 10px;
          color: #1a3a6c;
        }
        
        .contact-info {
          margin: 15px 0;
        }
        
        .cpd-badge {
          text-align: center;
          margin: 30px 0;
          font-weight: bold;
          font-size: 24px;
          color: #1a3a6c;
          letter-spacing: 2px;
        }
        
        .seal {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 100px;
          height: 100px;
          border: 2px solid #d4af37;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #1a3a6c;
          font-size: 14px;
          text-align: center;
          padding: 10px;
        }
        
        @media (max-width: 768px) {
          .certificate-container {
            padding: 20px;
            border-width: 10px;
          }
          
          .certificate-border {
            padding: 20px 15px;
          }
          
          .header h1 {
            font-size: 32px;
          }
          
          .header h2 {
            font-size: 20px;
          }
          
          .recipient-name {
            font-size: 24px;
          }
          
          .details-grid {
            grid-template-columns: 1fr;
          }
          
          .seal {
            width: 80px;
            height: 80px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificateList;
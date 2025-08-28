# AgriNexus AI User Account Types & Roles

## Overview
AgriNexus AI supports a comprehensive role-based access control (RBAC) system designed for agricultural operations. The platform accommodates various stakeholders in the agricultural value chain with specific permissions and dashboard configurations.

## Agricultural Role Types

### 1. **Super Admin**
- **Description**: Highest level administrator with full system access
- **Access Level**: Global system administration across all tenants
- **Key Permissions**:
  - Tenant management (create, read, update, delete)
  - Full access to all farms, fields, crops, and activities
  - System configuration and audit controls
  - Billing and analytics oversight
  - Complete user and transaction management

### 2. **System Admin**
- **Description**: Administrator for a specific tenant/organization
- **Access Level**: Full administrative access within tenant
- **Key Permissions**:
  - User management and audit logging
  - Complete farm operations oversight
  - System configuration within tenant
  - Financial transactions and reporting
  - Equipment and inventory management

### 3. **Farm Owner**
- **Description**: Owner of agricultural operations
- **Access Level**: Full control over owned farms
- **Key Permissions**:
  - Complete farm management (farms, fields, crops)
  - Equipment and inventory oversight
  - Marketplace participation
  - Financial reporting and analytics
  - Worker management

### 4. **Farm Manager**
- **Description**: Manages day-to-day farm operations
- **Access Level**: Operational management of assigned farms
- **Key Permissions**:
  - Farm and field management
  - Crop lifecycle management
  - Worker supervision
  - Equipment scheduling
  - Marketplace activities
  - Operational reporting

### 5. **Field Manager**
- **Description**: Manages specific fields within farms
- **Access Level**: Field-level operations
- **Key Permissions**:
  - Field and crop management
  - Activity planning and execution
  - Basic inventory access
  - Worker coordination

### 6. **Agronomist**
- **Description**: Agricultural expert providing technical advice
- **Access Level**: Advisory and recommendation system
- **Key Permissions**:
  - Crop health assessment
  - Technical recommendations
  - Activity planning
  - Specialized reporting
  - Research data access

### 7. **Field Worker**
- **Description**: Front-line agricultural workers
- **Access Level**: Task execution and data collection
- **Key Permissions**:
  - Task completion and check-in
  - Basic crop and field data entry
  - Equipment usage logging
  - Activity reporting

### 8. **Equipment Operator**
- **Description**: Specialized equipment handlers
- **Access Level**: Equipment-focused operations
- **Key Permissions**:
  - Equipment operation and maintenance
  - Usage logging and reporting
  - Activity completion
  - Safety compliance

### 9. **Supervisor**
- **Description**: Supervises field operations and workers
- **Access Level**: Oversight of field activities
- **Key Permissions**:
  - Worker supervision
  - Activity oversight
  - Progress monitoring
  - Basic reporting

### 10. **Cooperative Admin**
- **Description**: Administrator of agricultural cooperatives
- **Access Level**: Cooperative member and resource management
- **Key Permissions**:
  - Member management
  - Collective farm oversight
  - Marketplace coordination
  - Cooperative reporting
  - Resource allocation

### 11. **Cooperative Member**
- **Description**: Member of agricultural cooperative
- **Access Level**: Limited access to cooperative resources
- **Key Permissions**:
  - Personal farm data access
  - Marketplace participation
  - Cooperative communications
  - Basic reporting

### 12. **Input Supplier**
- **Description**: Supplier of agricultural inputs (seeds, fertilizer, etc.)
- **Access Level**: Supply chain management
- **Key Permissions**:
  - Inventory management
  - Marketplace listings
  - Order processing
  - Supply chain analytics

### 13. **Buyer**
- **Description**: Purchaser of agricultural products
- **Access Level**: Procurement and purchasing
- **Key Permissions**:
  - Marketplace browsing and purchasing
  - Order management
  - Transaction history
  - Quality assessment

### 14. **Aggregator**
- **Description**: Collector and distributor of agricultural products
- **Access Level**: Collection and distribution management
- **Key Permissions**:
  - Multi-farm coordination
  - Logistics management
  - Bulk purchasing and sales
  - Supply chain optimization

## System User Types (Legacy)

### Basic Admin Roles
1. **Admin** - Full system administration
2. **Manager** - Operations management
3. **Operator** - Task execution
4. **Viewer** - Read-only access

## Permission Matrix

| Role | Farms | Fields | Crops | Activities | Equipment | Inventory | Marketplace | Reports | Users | System |
|------|-------|--------|-------|------------|-----------|-----------|-------------|---------|-------|--------|
| Super Admin | Full | Full | Full | Full | Full | Full | Full | Full | Full | Full |
| System Admin | Full | Full | Full | Full | Full | Full | Full | Full | Full | Config |
| Farm Owner | Full | Full | Full | Full | Full | Full | Full | Read | - | - |
| Farm Manager | Full | Full | Full | Full | Full | Full | Full | Full | Limited | - |
| Field Manager | Limited | Full | Full | Full | - | Read | - | - | - | - |
| Agronomist | Read | Read | Full | Full | - | - | - | Full | - | - |
| Field Worker | Read | Read | Read | Full | Read | - | - | - | - | - |
| Equipment Operator | - | - | - | Full | Full | - | - | - | - | - |
| Supervisor | Read | Read | Read | Full | Read | - | - | - | Read | - |
| Cooperative Admin | Full | Full | Full | Full | Limited | Limited | Full | Full | Limited | - |
| Cooperative Member | Read | Read | Read | Read | - | - | Read | Read | - | - |
| Input Supplier | - | - | - | - | - | Read | Full | - | - | - |
| Buyer | - | - | - | - | - | - | Read | - | - | - |
| Aggregator | Read | - | Read | - | - | - | Full | Read | - | - |

## Dashboard Configurations

### Default Routes by Role
- **Super Admin**: `/super-admin/tenants`
- **System Admin**: `/admin/overview`
- **Farm Owner**: `/dashboard/overview`
- **Farm Manager**: `/dashboard/management`
- **Field Worker**: `/dashboard/tasks`
- **Agronomist**: `/dashboard/advisory`
- **Equipment Operator**: `/dashboard/equipment`
- **Cooperative Admin**: `/coop/dashboard`
- **Buyer**: `/buyer/marketplace`
- **Aggregator**: `/aggregator/overview`

### Available Modules by Role

#### Farm Owner Modules
- Overview, Fields, Crops, Equipment, Inventory, Marketplace, Reports, Weather

#### Farm Manager Modules
- Management, Fields, Crops, Workers, Equipment, Inventory, Marketplace, Reports, Analytics

#### Field Worker Modules
- Tasks, Check-in, Crops, Activities, Weather

#### Agronomist Modules
- Advisory, Crops, Health, Recommendations, Reports

## Security Features

### Multi-Factor Authentication (MFA)
- Required for Admin and Super Admin roles
- Optional for other roles
- TOTP-based authentication

### Session Management
- 30-minute session timeout
- Automatic token refresh every 5 minutes
- Secure token storage with encryption

### Audit Logging
- All user actions logged
- Login/logout tracking
- Permission change notifications
- Security event monitoring

## Implementation Notes

### Role Assignment
- Roles are assigned during user creation
- Can be modified by users with appropriate permissions
- Changes take effect immediately
- Users notified of role changes

### Tenant Isolation
- Each tenant has isolated user base
- Cross-tenant access restricted to Super Admin
- Data segregation enforced at database level

### Scalability
- Role system supports custom tenant-specific roles
- Permission system extensible for new features
- Dashboard modules configurable per tenant

---

*Last Updated: August 28, 2025*
*Version: 1.0*
*Platform: AgriNexus AI Agricultural Management System*
# Company-Management
The Company Management System is a comprehensive solution for managing company operations such as employee hiring, payroll, and hierarchical structuring. It is designed to streamline company processes by providing an all-in-one platform for HR, payroll management, and organizational structure management.
## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Controllers](#controllers)
- [Technologies Used](#technologies-used)
- [License](#license)
## Description

The **Company Management System** allows companies to handle a wide range of tasks, including:

- Managing employee data and profiles.
- Handling the recruitment and hiring process.
- Processing payroll for employees.
- Structuring the organization into departments, teams, and roles.
- Maintaining hierarchical structures for reporting and decision-making.

The system is highly customizable, allowing organizations to configure workflows and roles to match their specific needs.
## Usage

- **Employee Management**: Add, edit, and manage employee profiles.
- **Hiring Process**: Streamline recruitment and onboarding of new employees.
- **Payroll Management**: Automate salary payments, track employee compensation, and handle tax deductions.
- **Organizational Structure**: Create and maintain the company hierarchy with departments, teams, and reporting lines.
- **Permissions and Roles**: Assign roles to employees to manage access and workflows.
- **Real-time Updates**: Ensure organizational changes are reflected in real-time across the platform.
- ** Payment **: Another microservice for payrolls and other transactions.(Still completing this services)
## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (for employee data, payroll records, and hierarchical structure)
- **Authentication**: JWT-based authentication for secure login along with MFA for Administrative Users, High-Security Actions (such as approving financial transactions) and Remote Logins.
- **File Uploads**: Cloudinary and AWS S3 integration for profile photos and document management.
- **Frontend**: React.js (Considering to create one, as of now it has no frontend)
- **Kafka**: For facilitating asynchronous communication between the **User** and **Payment** services, enabling real-time data processing and ensuring reliable message delivery. Kafka acts as a messaging queue that decouples these services, allowing them to scale independently while maintaining efficient data flow and consistency across transactions.
- **Deployment**: Docker and AWS for scalable deployment
## Installation

To get started with the **Company Management System**, follow these steps:

### 1. Clone the repository:
```bash
git clone https://github.com/Mayank06711/Company-Management.git
```
### Installing dependencies
```bash
npn install
```
### Environment Variable
Check .envSample for fully utilisig all features.
### Run the server
```bash
npm run dev
npm start
```
### Access the API
The API will be available at http://localhost:9001
### API Endpoints
As of now there are only 18 api endpoints and few are yet to come.
This can be seen in routes folder under src directory.
### Controllers
All the controllers are written to follow OPPs principle and everything is so structured you won`t have any problem understanding that, still feel free to search how controllers work on any AI like gemini or chatGpt. 
## Contact

- **Mayank Soni** - [mayankatwork67@gmail.com](mailto:mayankatwork67@gmail.com)
- **GitHub**: [Mayank06711](https://github.com/Mayank06711)

## License

This project is currently under consideration for an open-source license. The final license will be added once confirmed.





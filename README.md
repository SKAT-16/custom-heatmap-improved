# Custom Heatmap Project

A PHP-based heatmap tracking system that allows you to visualize user interactions on your web pages.

## Features

- Real-time heatmap visualization
- Tracks mouse movements and clicks
- Database storage for heatmap data
- Customizable heatmap display
- API endpoints for data collection
- Modern web interface

## Project Structure

```
custom-heatmap/
├── v2/
│   ├── api/
│   │   └── track.php        # API endpoint for tracking data
│   ├── db/
│   │   └── db.php           # Database connection and queries
│   ├── heatmap.js           # Main heatmap visualization script
│   └── index.html           # Main interface
└── README.md                # This file
```

## Requirements

- PHP 7.4 or higher
- MySQL/MariaDB database
- Modern web browser (Chrome, Firefox, Safari)
- Web server (Apache/Nginx)

## Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Configure your database
   - Create a MySQL database
   - Update database credentials in `v2/db/db.php`

3. Set up your web server
   - Configure your web server to point to the project directory
   - Ensure PHP is properly configured

4. Enable PHP extensions
   - mysqli
   - json
   - pdo

## Usage

1. Open `index.html` in your web browser
2. Start interacting with the page
3. The heatmap will automatically update in real-time
4. Mouse movements and clicks are tracked and displayed

## API Endpoints

- `/api/track.php` - Endpoint for collecting tracking data
  - Accepts POST requests with tracking data
  - Stores data in the database

## Configuration

The project can be configured through:
- Database settings in `v2/db/db.php`
- Heatmap visualization settings in `v2/heatmap.js`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please:
- Open an issue in the repository
- Include detailed information about your problem
- Provide relevant error messages
- Specify your environment details
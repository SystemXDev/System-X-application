# System-X-application Discord Bot

Welcome to the System-X-application Discord bot repository! This bot is designed to handle staff and developer applications within your Discord server.

## Features

1. **Staff Applications:** Users can apply for staff positions using the `/apply` command.
2. **Developer Applications:** Users can apply for developer roles using the `/apply` command.

## Installation

To use this bot, follow these steps:

1. Clone this repository to your local machine.
2. Install the required dependencies using `npm install`.
3. Configure the bot by editing the `config.json` file.
4. Run the bot using `node index.js`.

## Usage

Once the bot is running, users can apply for staff or developer positions using the `/apply` command. The bot will ask a series of questions based on the type of application.

## Contributing

We welcome contributions from the community! If you want to contribute to this project, please follow these guidelines:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -am 'Add new feature'`).
4. Push your changes to the branch (`git push origin feature-branch`).
5. Create a new Pull Request.

## Support

If you need help or have any questions, please join our Discord server [here](insert your discord invite link).

## License

This project is licensed under the [License Name] - see the [LICENSE.md](LICENSE.md) file for details.

---

### To Customize Application Questions

To customize the application questions for staff or developers, follow these steps:

1. Open `index.js` in your code editor.
2. Find the following lines:

```javascript
const staffQuestions = [
    "Why do you want to be staff?",
    "Have you been staff in a dev server before?",
    "Do you agree to follow our rules? (yes/no)", // Updated label here
    "Do you agree to follow Discord TOS? (yes/no)" // Updated label here
];

const devQuestions = [
    "What coding languages do you know?",
    "Why do you want to be a trusted dev?",
    "Years of experience in development?",
    "Agree to help others and receive profit?"
];

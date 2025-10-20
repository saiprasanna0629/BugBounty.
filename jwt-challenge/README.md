# HackerRank Challenge Description

## JWT Security Challenge: InnovaTech Employee Portal

### Difficulty: Medium

**Category:** Web Security | Authentication
**Points:** 50
**Time Limit:** None

***

## Challenge Description

InnovaTech Solutions has deployed a new employee management portal that uses JSON Web Tokens (JWT) for authentication. Your task is to test the security of their authentication system and identify any vulnerabilities that could allow unauthorized access to administrative functions.

As a security researcher, you've been given access to a test account. Your objective is to find a way to escalate your privileges and delete a specific employee account from the system.

***

## Objective

Access the InnovaTech Employee Portal and exploit a vulnerability in the JWT authentication system to:

1. Gain administrator privileges
2. Delete the employee account for user **anderson**
3. Retrieve the bounty code displayed upon successful deletion

***

## Environment Details

**Portal URL:** `http://localhost:3000` (or provided deployment URL)

**Test Credentials:**

- Username: `johnson`
- Password: `password123`

***

## Constraints

- The bounty code must match exactly (case-sensitive)
- You must use the provided test account credentials
- The target user to delete is **anderson**
- You must obtain the bounty code through the web application interface

***

## Hints

1. JWT tokens typically consist of three parts separated by dots: `header.payload.signature`
2. Modern browsers provide Developer Tools (F12) to inspect network requests and cookies
3. The JWT payload is Base64URL encoded and can be decoded to view its contents
4. Pay attention to how the server validates authentication tokens
5. The `sub` claim in a JWT payload typically identifies the user

***

## Expected Output

After successfully exploiting the vulnerability and deleting the target user, you should receive a bounty code in the following format:

```
Bounty: 9B2C3F4D7A5E8D1F0B9C2A6E4D3F7A1C
```

Submit this exact string to complete the challenge.

***

## Author

Anonymous1857

***

**Good luck, and happy hacking!** 🎯
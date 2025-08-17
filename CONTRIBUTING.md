# Contributing to CCTP Gateway Protocol

We welcome contributions to the CCTP Gateway Protocol! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating issues
3. **Provide detailed information**:
   - Environment details (OS, Node.js version, browser)
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages and stack traces
   - Transaction hashes (if applicable)

### Suggesting Features

1. **Check the roadmap** for planned features
2. **Open a discussion** before implementing large features
3. **Provide clear use cases** and justification
4. **Consider backward compatibility**

### Code Contributions

#### Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/your-username/cctp-gateway
cd cctp-gateway

# Install dependencies
npm install

# Copy environment template
cp env.example .env.local

# Run tests to verify setup
npm test
```

#### Development Workflow

1. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
```bash
npm run test
npm run test:contracts
npm run lint
npm run type-check
```

4. **Commit your changes**
```bash
git add .
git commit -m "feat: add your feature description"
```

5. **Push and create PR**
```bash
git push origin feature/your-feature-name
```

## 📝 Coding Standards

### TypeScript/JavaScript

- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Use **meaningful variable names**
- Add **JSDoc comments** for public functions
- Prefer **functional components** and hooks

```typescript
/**
 * Initiates a cross-chain USDC transfer
 * @param params - Transfer parameters
 * @returns Promise that resolves when transfer is initiated
 */
export async function initiatePayment(
  params: CrossChainPaymentParams
): Promise<void> {
  // Implementation
}
```

### Solidity

- Use **Solidity 0.8.19+**
- Follow **OpenZeppelin** patterns
- Add **comprehensive comments**
- Use **custom errors** instead of require strings
- Include **NatSpec documentation**

```solidity
/**
 * @title GatewayWallet
 * @notice Handles USDC deposits and cross-chain transfer initiation
 * @dev Implements pausable and upgradeable patterns
 */
contract GatewayWallet {
    /// @notice Insufficient balance for transfer
    error InsufficientBalance();
    
    /**
     * @notice Deposits USDC to the gateway
     * @param token The token address to deposit
     * @param amount The amount to deposit
     */
    function deposit(address token, uint256 amount) external {
        // Implementation
    }
}
```

### React Components

- Use **functional components** with hooks
- Implement **proper error boundaries**
- Add **accessibility attributes**
- Use **TypeScript interfaces** for props

```typescript
interface CrossChainPaymentProps {
  className?: string;
  onTransferComplete?: (txHash: string) => void;
  onTransferError?: (error: string) => void;
}

export function CrossChainPayment({
  className,
  onTransferComplete,
  onTransferError
}: CrossChainPaymentProps) {
  // Implementation
}
```

## 🧪 Testing Guidelines

### Unit Tests

- **Test all public functions**
- **Mock external dependencies**
- **Use descriptive test names**
- **Aim for >90% coverage**

```typescript
describe('useCrossChainPayment', () => {
  test('should initiate payment successfully', async () => {
    const { result } = renderHook(() => useCrossChainPayment());
    
    await act(async () => {
      await result.current.initiatePayment(mockParams);
    });
    
    expect(result.current.paymentStatus.status).toBe('completed');
  });
});
```

### Contract Tests

- **Test all contract functions**
- **Include edge cases**
- **Test access controls**
- **Verify events are emitted**

```solidity
function testDeposit() public {
    uint256 amount = 100e6; // 100 USDC
    
    vm.prank(user);
    usdc.approve(address(gateway), amount);
    
    vm.expectEmit(true, true, false, true);
    emit Deposited(address(usdc), user, amount);
    
    vm.prank(user);
    gateway.deposit(address(usdc), amount);
    
    assertEq(gateway.balances(address(usdc), user), amount);
}
```

### Integration Tests

- **Test complete user flows**
- **Verify cross-chain functionality**
- **Test error scenarios**

## 📚 Documentation

### Code Documentation

- **Add JSDoc/NatSpec** comments for all public functions
- **Document complex algorithms**
- **Explain business logic**
- **Include usage examples**

### User Documentation

- **Update relevant guides** when adding features
- **Include screenshots** for UI changes
- **Provide code examples**
- **Update troubleshooting** if needed

## 🔒 Security Guidelines

### Code Security

- **Never commit private keys** or sensitive data
- **Validate all inputs** thoroughly
- **Use established patterns** (OpenZeppelin)
- **Follow principle of least privilege**

### Smart Contract Security

- **Use reentrancy guards** where needed
- **Implement proper access controls**
- **Add pause mechanisms** for emergencies
- **Consider upgrade patterns** carefully

### Frontend Security

- **Validate user inputs** on frontend and backend
- **Sanitize data** before displaying
- **Use secure communication** (HTTPS)
- **Implement proper error handling**

## 🚀 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] PR description explains changes

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** on testnets if applicable
4. **Documentation review**
5. **Final approval** and merge

## 🏷️ Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(hooks): add cross-chain payment hook
fix(contracts): resolve reentrancy vulnerability
docs(readme): update installation instructions
test(integration): add end-to-end transfer tests
```

## 🎯 Development Priorities

### High Priority

- Security improvements
- Bug fixes
- Performance optimizations
- Documentation improvements

### Medium Priority

- New features
- Developer experience improvements
- Additional chain support
- UI/UX enhancements

### Low Priority

- Code refactoring
- Style improvements
- Non-critical optimizations

## 📞 Getting Help

### Community Support

- **Discord**: [Join our community](https://discord.gg/your-org)
- **GitHub Discussions**: [Ask questions](https://github.com/your-org/cctp-gateway/discussions)
- **Stack Overflow**: Tag questions with `cctp-gateway`

### Maintainer Contact

- **Technical Questions**: [tech@your-org.com](mailto:tech@your-org.com)
- **Security Issues**: [security@your-org.com](mailto:security@your-org.com)
- **General Inquiries**: [hello@your-org.com](mailto:hello@your-org.com)

## 🙏 Recognition

Contributors will be recognized in:

- **Contributors section** of README
- **Release notes** for their contributions
- **Hall of fame** on project website
- **Special mentions** in community updates

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

---

Thank you for contributing to CCTP Gateway Protocol! 🚀

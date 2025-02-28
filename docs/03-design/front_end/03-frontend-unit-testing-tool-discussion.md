<!-- SPDX-License-Identifier: Apache-2.0 -->
# Frontend Unit Testing Tool Discussion

## Background

Jest and Vitest are popular testing frameworks in the JavaScript ecosystem, commonly used for testing React and Next.js applications. Both provide a robust set of features to facilitate unit and integration testing, but they have distinct characteristics and use cases. Jest is a tried-and-true option with robust support for Next.js, making it a safe choice for many projects. Vitest offers a modern alternative with significant performance improvements, especially appealing for teams prioritizing speed and those already working within the Vite ecosystem.

## Links

 - [Vitest](https://vitest.dev/)
 - [Jest](https://jestjs.io/)

## Options considered

### Jest vs Vitest

#### Jest Pros:
- Well-established with strong Next.js and React integration.
- Comprehensive documentation and community support.
- Extensive mocking and testing utilities.

#### Jest Cons:
- Can be slower compared to Vitest for test execution.
- May require additional setup for TypeScript projects.

#### Vitest Pros:
- Fast test execution leveraging Vite.
- Native TypeScript support.
- Compatible with Jest's API, easing migration efforts.

#### Vitest Cons:
- Relatively new, with a smaller community and fewer resources specific to Next.js.
- May require additional integration effort for Next.js projects not using Vite.

#### Jest for Next.js Testing

- **Better Integration**: Jest has been the industry standard for React and Next.js applications for years. It is well-documented and widely supported within the Next.js community. Given its deep integration and the wealth of community knowledge, Jest is often the safer and more straightforward choice for Next.js projects.
- **Comprehensive Features**: Jest offers a vast array of features out of the box, including mocking, snapshots, and coverage reports, which are crucial for thorough testing strategies in complex applications.
- **Ease of Setup**: Since Jest is a well-established solution for Next.js testing, you'll find ample resources, guides, and support for setting it up in your Next.js project.

#### Vitest for Next.js Testing

- **Performance**: Vitest, built on top of Vite, is designed for speed. It leverages Vite's fast module bundler and offers significantly quicker test execution times, which can be a crucial factor for large projects with thousands of tests.
- **Modern Tooling**: For projects that prioritize modern tooling and are already using Vite (through custom setups with Next.js), Vitest can seamlessly integrate into your workflow, providing a development experience consistent with Vite's ecosystem.
- **Jest-like Experience**: Vitest is designed to be a drop-in replacement for Jest, with similar API and configuration options, making it easier for teams familiar with Jest to transition.

### Comparison of features

| Feature/Aspect | Jest | Vitest |
|----------------|------|--------|
| **Integration with Next.js** | Excellent, as Jest is widely used and recommended for React and Next.js applications. | Good, but since Vitest is newer and optimized for Vite, it might require additional setup for seamless integration with Next.js. |
| **Performance** | Good, with optimizations available but generally slower test startup and execution compared to Vitest due to its architecture. | Excellent, designed for speed leveraging Vite for faster test execution and quicker hot module reloading. |
| **Ecosystem** | Very large, with extensive support and a vast array of plugins, making it highly versatile for various testing needs. | Growing, with a focus on the Vite ecosystem. It might have fewer plugins specifically tailored for Next.js applications. |
| **API Compatibility** | N/A, Jest provides its own set of APIs and has set the standard for many testing practices in the JavaScript ecosystem. | High, aims to be a drop-in replacement for Jest, supporting most Jest features and APIs to ease migration. |
| **Learning Curve** | Moderate, widely used in the React community with plenty of tutorials and documentation available. | Moderate to low for existing Jest users due to similar APIs. For new users, the learning curve is similar to Jest, with potentially less community support. |
| **Mocking and Spies** | Extensive support for mocking functions, modules, and timers, crucial for unit and integration testing. | Also offers comprehensive mocking capabilities, with some differences in implementation details compared to Jest. |
| **TypeScript Support** | Good, with support through Babel or ts-jest, but requires additional configuration. | Excellent, with native TypeScript support out of the box, simplifying the setup for TypeScript projects. |
| **Code Coverage** | Built-in support for code coverage without the need for additional tools. | Native code coverage support, leveraging Vite's built-in capabilities for an efficient workflow. |
| **Community and Resources** | Vast, with extensive resources, examples, and community support available for almost any testing scenario. | Growing, with increasing resources and community support, especially within the Vite ecosystem. |
| **React Testing Library Compatibility** | High compatibility. Jest works seamlessly with the React Testing Library, providing a smooth experience for testing React components. | High compatibility. Vitest also works well with the React Testing Library, thanks to its Jest-like API and fast execution times. |

### Conclusion

- **For Traditional Next.js Projects**: **Jest** is generally the better choice due to its comprehensive feature set, strong integration with Next.js, and extensive community support. It's ideal for teams looking for stability and a proven track record.
- **For Performance-Oriented or Vite-Integrated Projects**: **Vitest** could be the better option if your Next.js project is already leveraging Vite through custom setups, or if test suite execution speed is a critical concern for your development workflow.

My recommendation is we proceed with Jest for unit testing because of how well it integrates with Next.js, its library of tools and its extensive community support.

## Action items

*   Review all options
*   Agree on an approach

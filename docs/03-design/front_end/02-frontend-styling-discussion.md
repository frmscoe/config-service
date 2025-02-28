<!-- SPDX-License-Identifier: Apache-2.0 -->
# Frontend Styling Discussion

## Background

Dynamic theming and style updating are critical features for modern web applications, especially those that offer customizable user interfaces or need to adapt to different themes dynamically. Much like content translation, being able to transform the look and feel of the application with ease is crucial.

This will cover the reasons for changing from Tailwind CSS to Styled-components for managing and maintaining the styles across the site.

### Practical examples

1. **Dynamic Theming in a Reading App**:
	- **Day Mode**: Bright background, dark text. Ideal for reading in bright environments.
	- **Night Mode**: Dark background, light text. Reduces eye strain in dark environments.
	- Users can switch between modes with a simple toggle button.
2. **Style Updating in a Task App**:
	- **Uncompleted Tasks**: Displayed with a normal font and a red checkmark.
	- **Completed Tasks**: When a task is marked completed, the font changes to strikethrough, and the checkmark turns green.
	- This visual feedback instantly communicates the status of each task to the user.

## Links

 - [Styled-components](https://styled-components.com/)
 - [Tailwind CSS](https://tailwindcss.com/)

## Options considered

### Styled-components vs Tailwind CSS

#### Styled-Components Pros:
- **JavaScript-Powered**: Leveraging the full power of JavaScript makes it easier to implement dynamic theming and style manipulations based on props, state, or context.
- **Component-Level Styling**: Encourages a component-centric approach to styling, which is particularly beneficial in React applications for scoped styles and themes.
- **CSS in JS**: Writing CSS in JavaScript files allows for more dynamic and conditional styling logic, facilitating complex theme changes at runtime.
- **Seamless Theme Integration**: The `ThemeProvider` component simplifies theme implementation across the entire application, making it easy to switch themes dynamically.

#### Styled-Components Cons:
- **Performance Overhead**: CSS-in-JS can introduce additional runtime overhead, potentially impacting performance, especially in large-scale applications. This can be mitigated through writing clean reusuable styling code.
- **Learning Curve**: Requires familiarity with JavaScript and component patterns, which might be a hurdle for developers more accustomed to traditional CSS.
- **Bundle Size**: Depending on usage, it can increase the final bundle size due to the inclusion of CSS-in-JS libraries and runtime.

#### Tailwind CSS Pros:
- **Utility-First Approach**: Encourages building designs directly in the markup, which can speed up the development process and enforce consistency.
- **Highly Customizable**: The `tailwind.config.js` file allows for extensive customization of the design system, including themes.
- **Performance**: As a CSS framework, Tailwind CSS does not introduce JavaScript runtime overhead, potentially offering better performance for styling.
- **Community and Ecosystem**: A large community and ecosystem provide plugins, tools, and resources for extending its capabilities.

#### Tailwind CSS Cons:
- **Dynamic Theming Complexity**: Implementing dynamic theming might require additional setup, such as using CSS custom properties or toggling class names through JavaScript, which can be less intuitive compared to Styled-Components.
- **Markup Clutter**: The utility-first approach can lead to cluttered HTML markup, making it harder to read and maintain, especially for complex components.
- **Learning Curve**: While different from Styled-Components, Tailwind CSS has its own learning curve, particularly in mastering the utility classes and customization options.
- **Static Nature**: Tailwind's design leans towards static styling out of the box, which means dynamic styling scenarios require more effort or additional tooling.

### Comparison of features

This highlights the inherent advantages of styled-components for applications requiring dynamic theming and style updates, largely due to its deep JavaScript integration and ease of handling dynamic styles. Tailwind CSS, while offering rapid development and a utility-first approach for static styling, requires more effort and additional strategies for achieving comparable flexibility in dynamic theming and style updates.

| Feature/Aspect              | Styled-Components                                                      | Tailwind CSS                                                          |
|---------------------------|---------------------------------------------------------------------|-----------------------------------------------------------------------|
| **Dynamic Theming**       | **Highly Flexible**: Easily integrates with JavaScript to enable dynamic theming based on props, state, or context. | **Less Flexible**: Supports static theming through configuration; dynamic theming requires additional JavaScript or CSS variables. |
| **Style Updating**         | **Seamless**: Styles can be updated in real-time with changes in props or state, offering granular control over component styles. | **More Complex**: Dynamic style updates often involve manipulating classes with JavaScript, which can be less efficient and more cumbersome. |
| **JavaScript Integration** | **Deep Integration**: Styles as JavaScript functions allow for complex logic and dynamic updates directly tied to application state. | **Indirect Integration**: Relies on utility classes defined at build time; JavaScript is used externally to manipulate classes for dynamic updates. |
| **Ease of Use**            | **Intuitive for React Developers**: Leveraging familiar React concepts makes styled-components natural and straightforward for dynamic theming. | **Utility-first Approach**: While powerful for static styles, requires additional strategies for dynamic theming and updates, potentially increasing complexity. |
| **Performance**            | **Optimized**: Only injects and updates styles when necessary, reducing unnecessary recalculations and improving performance for dynamic styles. | **Static Optimization**: Optimized for static builds; dynamic updates might introduce performance hits due to the need for runtime class manipulations. |

- **Deep JavaScript Integration**: Styled-components' integration with JavaScript makes it inherently more suited for dynamic theming and style updates. Styles are functions of props and can be updated in real time, offering a seamless experience for applications requiring dynamic style changes.

- **Ease of Use**: Implementing dynamic theming and style updates with styled-components is more natural within the React ecosystem. It leverages existing React concepts like props, state, and context, making it easier for React developers to adopt and use effectively.

- **Performance**: While both libraries are optimized for performance, styled-components allows for more granular optimization when dealing with dynamic styles, as styles are only injected and updated when necessary, reducing unnecessary style recalculations.

In summary, styled-components offers superior capabilities for applications that require dynamic theming and style updates due to its deep integration with JavaScript, ease of use within React, and efficient handling of dynamic style changes. Tailwind CSS, while highly effective for static utility-based styling, requires additional workarounds for similar levels of dynamic styling flexibility.

### Conclusion

Because we're building an app that will need its look and feel changed simply through configuration data, using this we can change colours, font sizes, layouts etc by passing configuration and the app will consume this and update the look and feel dynamically. Having styled-components handle this is better, trying to do theme changing with tailwind means adding more code and overwriting default behaviour of classes. Or using javascript to swap out class names.

This approach also means being able to transform the look and feel of the app while using it. For example many sites offer an accessibility feature of being able to switch between a light and dark theme for people with impaired vision.

It means if we have the ability to dynamically update styles across all components simply by passing different configuration it leaves the door open for easily changing the look and feel of the app for whoever is using it, and also changing styles for accessibility purposes while using the app if needed. It keeps options open, and keeps styling and content updates closely tied together. As easily as changing the translation of content on the site.

The product we are creating will be used as a white label solution, along with a reusable design system of components and styles. Which means being able to update the content and style easily through configuration, and to be able to transform the look and feel of the app through theming. Because of this requirement it is my recommendation that we manage the styling and design for the app through the use of Styled-components.

## Action items

*   Review all options
*   Agree on an approach


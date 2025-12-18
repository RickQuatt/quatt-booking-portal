import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./Accordion";

const meta: Meta<typeof Accordion> = {
  title: "UI/Accordion",
  component: Accordion,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that you can customize.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It includes smooth animations for opening and closing.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const SingleOpen: Story = {
  render: () => (
    <Accordion type="single" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>First Item</AccordionTrigger>
        <AccordionContent>
          In single mode with collapsible disabled, only one item can be open at
          a time.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second Item</AccordionTrigger>
        <AccordionContent>
          Opening this item will close the previously opened item.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Feature One</AccordionTrigger>
        <AccordionContent>
          Multiple items can be open at the same time with type="multiple".
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Feature Two</AccordionTrigger>
        <AccordionContent>
          You can expand multiple sections without collapsing others.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Feature Three</AccordionTrigger>
        <AccordionContent>
          This is useful for displaying related content groups.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Long Content Section</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <p>
              This section contains longer content to demonstrate how the
              accordion handles multi-line text and multiple paragraphs.
            </p>
            <p>
              The accordion smoothly animates the content open and closed, and
              the chevron icon rotates to indicate the state.
            </p>
            <p>
              You can include any HTML content inside the AccordionContent
              component, including lists, forms, or other components.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithLists: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Features</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc pl-5 space-y-1">
            <li>Accessible component</li>
            <li>Smooth animations</li>
            <li>Customizable styles</li>
            <li>Multiple display modes</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Requirements</AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc pl-5 space-y-1">
            <li>React 16.8 or higher</li>
            <li>Radix UI primitives</li>
            <li>Lucide React for icons</li>
            <li>TailwindCSS for styling</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>Enabled Item</AccordionTrigger>
        <AccordionContent>This item can be opened and closed.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" disabled>
        <AccordionTrigger>Disabled Item</AccordionTrigger>
        <AccordionContent>
          This item cannot be interacted with.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Another Enabled Item</AccordionTrigger>
        <AccordionContent>This item is also interactive.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-lg font-bold hover:text-blue-600">
          Custom Styled Trigger
        </AccordionTrigger>
        <AccordionContent className="text-gray-600 italic">
          This accordion item uses custom styling classes applied to the trigger
          and content.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

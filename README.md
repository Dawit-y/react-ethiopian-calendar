# React Ethiopian Calendar

A React component library for Ethiopian calendar date selection with support for both single date and date range picking.

## Features

- **Single Date Picker**: Select individual dates in Ethiopian calendar format
- **Date Range Picker**: Select date ranges with visual highlighting
- **Dual Calendar Support**: Both Ethiopian (ET) and Gregorian (GC) calendar types
- **Language Support**: Amharic and English language options
- **Custom Primary Color**: Pass any hex color via the `primaryColor` prop to theme the entire calendar
- **Controlled Component**: Full control over value and onChange behavior
- **Form Integration**: Works seamlessly with form libraries like Formik
- **Customizable Styling**: Flexible styling options and CSS customization
- **Accessibility**: Keyboard navigation and screen reader support

## Installation

```bash
npm install react-ethiopian-calendar
```

## Basic Usage

### Single Date Picker

```jsx
import { EtCalendar } from 'react-ethiopian-calendar';
import 'react-ethiopian-calendar/src/style/index.css';

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <EtCalendar
      value={selectedDate}
      onChange={setSelectedDate}
      calendarType={true} // true for Ethiopian, false for Gregorian
      lang="am" // "am" for Amharic, "en" for English
    />
  );
}
```

### Date Range Picker

```jsx
import { EtCalendar } from 'react-ethiopian-calendar';
import 'react-ethiopian-calendar/src/style/index.css';

function MyComponent() {
  const [selectedRange, setSelectedRange] = useState({
    startDate: null,
    endDate: null
  });

  return (
    <EtCalendar
      value={selectedRange}
      onChange={setSelectedRange}
      dateRange={true} // Enable date range mode
      calendarType={true}
      lang="am"
    />
  );
}
```

## Props

### Common Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Date \| dayjs \| { startDate, endDate }` | `null` | Selected date(s) |
| `onChange` | `function` | - | Callback when date selection changes |
| `calendarType` | `boolean` | `true` | `true` for Ethiopian, `false` for Gregorian |
| `lang` | `string` | `"am"` | Language: `"am"` (Amharic) or `"en"` (English) |
| `disabled` | `boolean` | `false` | Disable the component |
| `minDate` | `Date` | - | Minimum selectable date |
| `maxDate` | `Date` | - | Maximum selectable date |
| `disableFuture` | `boolean` | `false` | Prevent selecting future dates |
| `fullWidth` | `boolean` | `false` | Make component full width |
| `borderRadius` | `string` | - | Custom border radius |
| `placeholder` | `boolean` | `false` | Show placeholder text |
| `label` | `string` | `"Date"` | Label for the input |
| `inputStyle` | `object` | - | Custom styles for the input |
| `onBlur` | `function` | - | Callback when input loses focus |
| `primaryColor` | `string` | `"#0253a5"` | Primary accent color for the calendar (any valid CSS hex color) |

### Date Range Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dateRange` | `boolean` | `false` | Enable date range selection mode |

## Date Range Picker Behavior

When `dateRange={true}` is set:

1. **First Click**: Sets the start date
2. **Second Click**: Sets the end date and closes the calendar
3. **Visual Feedback**: 
   - Start and end dates are highlighted with blue background
   - Dates within the range are highlighted with light blue background
   - Hover effects on range dates
4. **Auto-adjustment**: If end date is selected before start date, they are automatically swapped
5. **Reset**: Clicking a new date after both dates are selected starts a new range

## Form Integration

### With Formik

```jsx
import { useFormik } from 'formik';
import { EtCalendar } from 'react-ethiopian-calendar';

function MyForm() {
  const formik = useFormik({
    initialValues: {
      singleDate: null,
      dateRange: { startDate: null, endDate: null }
    },
    onSubmit: (values) => {
      console.log(values);
    }
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      {/* Single Date */}
      <EtCalendar
        value={formik.values.singleDate}
        onChange={(date) => formik.setFieldValue('singleDate', date)}
        onBlur={formik.handleBlur}
        name="singleDate"
        label="Select Date"
      />

      {/* Date Range */}
      <EtCalendar
        value={formik.values.dateRange}
        onChange={(range) => formik.setFieldValue('dateRange', range)}
        onBlur={formik.handleBlur}
        name="dateRange"
        label="Select Date Range"
        dateRange={true}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Theming / Custom Primary Color

Pass any hex color string to `primaryColor` to replace the default blue (`#0253a5`) across the entire calendar UI — including the header background, selected date highlight, and date range shading.

```jsx
// Warm orange theme
<EtCalendar
  value={selectedDate}
  onChange={setSelectedDate}
  primaryColor="#e85d04"
/>

// Forest green theme
<EtCalendar
  value={selectedDate}
  onChange={setSelectedDate}
  primaryColor="#2d6a4f"
/>
```

The color is applied via a scoped CSS custom property (`--et-primary-color`), so multiple calendars on the same page can each have a different color without global CSS conflicts.

## Styling

The component comes with default styles that can be customized via CSS. Key CSS classes:

- `.dateInRange` - Dates within the selected range
- `.rangeStart` - Start date of the range
- `.rangeEnd` - End date of the range
- `.selectedDate` - Selected single date
- `.currentMonth` - Dates in the current month
- `.grayText` - Disabled or out-of-range dates

### Custom Styling

```css
/* Custom range styling */
.dateInRange {
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}

.rangeStart,
.rangeEnd {
  background-color: #ff0000;
  color: white;
}
```

## Examples

See the `example/` directory for complete working examples including:

- Basic single date picker
- Date range picker
- Form integration with validation
- Custom styling examples

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- React 16.8+
- dayjs
- ethiopian-date
- react-element-popper

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

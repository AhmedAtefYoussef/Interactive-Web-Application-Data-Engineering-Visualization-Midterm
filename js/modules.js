// Course content. Each section body is HTML; <div data-widget="x"> marks where a simulator mounts.

const K = (t) => `<div class="callout key"><i class="ph ph-lightbulb"></i><div>${t}</div></div>`;
const T = (t) => `<div class="callout trap"><i class="ph ph-warning"></i><div><strong>Exam trap.</strong> ${t}</div></div>`;
const W = (name) => `<div class="bench" data-widget="${name}"></div>`;
const terms = (list) => `<div class="term-grid">${list.map(([i, h, p]) => `<div class="term"><h4><i class="ph ph-${i}"></i>${h}</h4><p>${p}</p></div>`).join('')}</div>`;
const compare = (a, b) => `<div class="compare">${[a, b].map(([icon, h, items]) => `<div><h4><i class="ph ph-${icon}"></i>${h}</h4><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></div>`).join('')}</div>`;
const steps = (list) => `<div class="steps">${list.map(([h, p]) => `<div><div><strong>${h}</strong><span>${p}</span></div></div>`).join('')}</div>`;

export const MODULES = [
  // ------------------------------------------------------------------ L1
  {
    id: 'l1', kind: 'lecture', num: 'L1', icon: 'flow-arrow',
    title: 'Introduction to Data Engineering',
    short: 'What data engineers do, why clean data matters, and the ETL process.',
    goals: ['Define data engineering', 'Contrast engineer vs scientist', 'Walk through ETL', 'Name the 3 tool families'],
    sections: [
      {
        id: 'what', title: 'What and why',
        body: `<div class="prose">
          <p>Data is created every time you do anything, and companies want to use it. That flood created two job directions: <strong>data engineers</strong> and <strong>data scientists</strong>.</p>
          <p><strong>Data engineering</strong> is all the work that makes data available to the people who use it, for analytics, for building an app, and so on. The engineer takes <strong>raw data</strong>, performs operations on it, and delivers <strong>clean data</strong>.</p>
          <p>Why bother? Because <strong>your insights are only as good as your data</strong>. Data workers spend more than 40% of their time searching for and preparing data instead of gaining insights, and on average they pull from more than six data sources and 40 million rows.</p>
        </div>
        ${terms([
          ['stack', 'Volume', 'Huge amounts of data, too much for one machine.'],
          ['lightning', 'Velocity', 'Data arrives fast and continuously.'],
          ['shapes', 'Variety', 'Tables, text, images, logs, sensor feeds.'],
          ['seal-check', 'Veracity', 'How trustworthy and accurate the data is.'],
        ])}
        ${K('The <b>4 Vs of big data</b> (Volume, Velocity, Variety, Veracity) explain why a dedicated engineering role exists at all.')}`
      },
      {
        id: 'prep', title: 'Data preparation and cleaning',
        body: `<div class="prose">
          <p><strong>Data preparation</strong> includes cleaning data, finding missing values, and converting data into a more organized format. Cleaning targets three kinds of problems:</p>
          <ul><li><strong>Duplicate values</strong>, but not always removed (see the checkpoint below).</li><li><strong>Corrupted values</strong>.</li><li><strong>Wrongly formatted values</strong>.</li></ul>
          <p>For <strong>missing (null) values</strong> that the system cannot accept, the two basic options from this lecture are to <strong>drop</strong> them or replace them with the <strong>average</strong> value. Lecture 6 extends this list.</p>
        </div>
        ${W('dupes')}
        ${T('"Always remove duplicates" is wrong. Two identical rows can be two real events, such as the same customer buying the same item twice in a day. Remove a duplicate only when it is the same event recorded twice.')}`
      },
      {
        id: 'roles', title: 'Engineer vs scientist',
        body: `<div class="prose"><p>What data engineers do: design <strong>efficient ways to store data</strong>, design <strong>pipelines</strong> that transform and move data from one place to the next, <strong>enhance data quality</strong>, and build <strong>architectures for big data</strong>. This course is <strong>not</strong> about machine learning or building models.</p></div>
        ${compare(['wrench', 'Data engineer', ['Cleans data', 'Develops an architecture that scales for big data', 'Builds and schedules pipelines', 'Makes data available and reliable']], ['brain', 'Data scientist', ['Mines data', 'Applies ML models', 'Finds patterns', 'Answers business questions with models']])}
        ${W('roles')}`
      },
      {
        id: 'tools', title: 'Tools of a data engineer',
        body: `${steps([
          ['Databases', 'SQL (relational, tables with a fixed schema) vs NoSQL (flexible documents, key-value, graphs).'],
          ['Processing tools', 'Quick; used to clean, join and aggregate; can use clusters of computers.'],
          ['Scheduling tools', 'Make data move at the correct times and in the correct order, for example joining only after cleaning has finished.'],
        ])}
        ${K('Scheduling is about <b>time and order</b>. If the join step runs before the cleaning step, you join dirty data. That is a scheduling failure, not a processing failure.')}`
      },
      {
        id: 'etl', title: 'The ETL process',
        body: `<div class="prose"><p><strong>ETL</strong> stands for <strong>Extract, Transform, Load</strong>.</p></div>
        ${steps([
          ['Extract', 'Pull data from different, heterogeneous sources: sensors, APIs, transactions, CRM and ERP systems, emails.'],
          ['Transform', 'Clean, validate and authenticate the data.'],
          ['Load', 'Move the data into the target data warehouse. It needs refreshing from time to time.'],
        ])}
        ${W('etl')}
        <div class="prose" style="margin-top:22px"><p><strong>In real life: Surtrac adaptive traffic lights.</strong> Extract live sensor feeds (cameras, radar), historic logs and incident APIs. Transform by cleaning and validating detections, aligning timestamps, mapping lanes and aggregating demand. Load low-latency features into the optimizer, plus periodic loads to the warehouse for QA. Reported impact: about <strong>25% shorter journeys, 40% less waiting, 30% fewer stops, 20% lower emissions</strong>.</p></div>
        ${T('Validating and authenticating belong to <b>Transform</b>, not Extract. Extract only gets the data out of its sources.')}`
      },
    ],
  },
  // ------------------------------------------------------------------ L2
  {
    id: 'l2', kind: 'lecture', num: 'L2', icon: 'stack',
    title: 'Data Exploration I',
    short: 'The modern data stack, batch vs stream, the project life cycle, data types and tidy tables.',
    goals: ['Map the modern stack', 'Choose batch or stream', 'Recite the 7-step life cycle', 'Classify NOIR data types', 'Tidy a messy table'],
    sections: [
      {
        id: 'landscape', title: 'The modern landscape',
        body: `${compare(['clock-counter-clockwise', 'Traditional (2015-2020)', ['Batch processing only', 'On-premises infrastructure', 'Manual ETL processes', 'Limited scalability']], ['cloud', 'Modern (2024-2025)', ['Real-time streaming', 'Cloud-native architecture', 'Automated DataOps', 'AI-driven optimization']])}
        <div class="prose"><p>Modern data engineering is about <strong>orchestrating components</strong>, not building them from scratch. Click each stage to see what it does and which tools live there.</p></div>
        ${W('stack')}`
      },
      {
        id: 'batch', title: 'Batch vs stream processing',
        body: `${compare(['package', 'Batch', ['Processes data in chunks', 'Higher latency (hours or days)', 'Good for historical analysis', 'Example: daily sales reports', 'Use for large-scale analytics, ML training, compliance reporting']], ['wave-sine', 'Stream', ['Processes data as it arrives', 'Low latency (seconds or minutes)', 'Good for real-time insights', 'Example: fraud detection', 'Use for monitoring, alerts, personalization, IoT']])}
        ${W('batchstream')}
        ${terms([
          ['warehouse', 'Data warehouses', 'Snowflake, BigQuery, Redshift. Scalable analytics storage.'],
          ['tree-structure', 'Orchestration', 'Apache Airflow, Prefect. Workflow automation.'],
          ['arrows-split', 'Transformation', 'dbt, Apache Spark. Modeling and processing.'],
          ['broadcast', 'Streaming', 'Apache Kafka, Flink. Real-time data movement.'],
          ['cloud', 'Cloud platforms', 'AWS, GCP, Azure. Infrastructure and services.'],
          ['heartbeat', 'Monitoring', 'Great Expectations, Monte Carlo. Data quality and observability.'],
        ])}`
      },
      {
        id: 'netflix', title: 'Case study: Netflix',
        body: `<div class="prose"><p>Challenge: process <strong>1+ trillion events per day</strong> for personalized recommendations.</p></div>
        ${steps([
          ['Ingestion', 'Kafka streams capture user interactions in real time.'],
          ['Processing', 'Spark processes events for immediate recommendations.'],
          ['Storage', 'S3 data lake stores raw events; Cassandra serves them.'],
          ['ML', 'Real-time feature engineering feeds the recommendation models.'],
          ['Monitoring', 'Custom tools track data quality and pipeline health.'],
        ])}
        ${K('Lessons: real-time processing enables instant personalization, microservices allow independent scaling, and data quality monitoring prevents bad recommendations.')}
        <div class="prose"><p>Hot skills: Python + SQL, cloud platforms, real-time processing (Kafka, Flink), Infrastructure as Code (Terraform), MLOps and DataOps. Public data sources: Google BigQuery public data, Kaggle datasets, AWS open data registry.</p></div>`
      },
      {
        id: 'lifecycle', title: 'Life cycle of a data science project',
        body: `${W('lifecycle')}
        <div class="prose" style="margin-top:18px"><p><strong>Boston Hubway</strong> (bike sharing, 393 stations, more than 3,800 bikes) shows how one dataset supports different questions: visualization of trips and <strong>redistribution optimization</strong> (moving bikes to where they will be needed).</p></div>
        ${T('Step 1 is <b>business understanding</b>, not data collection. Success depends on the questions and goals you set, including constraints such as budget.')}`
      },
      {
        id: 'types', title: 'Types of data',
        body: `<div class="prose"><p>Two families, four levels. Remember them in order as <strong>NOIR</strong>: each level adds one property.</p></div>
        <div class="tbl-wrap" style="margin:16px 0"><table class="tbl">
          <tr><th>Level</th><th>Family</th><th>Named classes</th><th>Order</th><th>Known differences</th><th>True zero</th><th>Example</th></tr>
          <tr><td><strong>Nominal</strong></td><td>Categorical</td><td>Yes</td><td>No</td><td>No</td><td>No</td><td>Gender, marital status</td></tr>
          <tr><td><strong>Ordinal</strong></td><td>Categorical</td><td>Yes</td><td>Yes</td><td>No</td><td>No</td><td>"How happy are you with your order?"</td></tr>
          <tr><td><strong>Interval</strong></td><td>Numerical</td><td>n/a</td><td>Yes</td><td>Yes</td><td>No</td><td>Satisfaction 1 to 7, temperature in °C</td></tr>
          <tr><td><strong>Ratio</strong></td><td>Numerical</td><td>n/a</td><td>Yes</td><td>Yes</td><td>Yes</td><td>4 g is twice as heavy as 2 g</td></tr>
        </table></div>
        ${W('datatypes')}
        ${T('The test for <b>ratio</b> is "can I say twice as much?". 20°C is not twice as hot as 10°C (0°C is not "no temperature"), so Celsius is interval. 4 kg really is twice 2 kg, so weight is ratio.')}`
      },
      {
        id: 'structure', title: 'Structures of data',
        body: `${terms([
          ['table', 'Structured', 'Tabular. Easily used by ML programs, queried with SQL. Limited storage options: data warehouses.'],
          ['brackets-curly', 'Semi-structured', 'XML, CSV, graphs (per the lecture), JSON. Has tags or separators but no rigid schema.'],
          ['image', 'Unstructured', 'Images (may have implicit structure), text files, social posts. Kept in data lakes with pay-as-you-go pricing. Needs expertise.'],
        ])}
        ${W('structure')}`
      },
      {
        id: 'tidy', title: 'Tabulating data (tidy tables)',
        body: `<div class="prose"><p>Three rules: <strong>each row is one object</strong>, <strong>each column is one variable</strong>, and <strong>headers are variables, not values</strong>.</p></div>
        ${W('tidy')}`
      },
    ],
  },
  // ------------------------------------------------------------------ L3
  {
    id: 'l3', kind: 'lecture', num: 'L3', icon: 'chart-scatter',
    title: 'Data Exploration II',
    short: 'Central tendency, dispersion, the five-number summary, and how human perception reads charts.',
    goals: ['Compute mean, weighted mean, median, mode', 'Read skew from their order', 'Build a box plot', 'Explain pre-attentive processing', 'Match chart to purpose'],
    sections: [
      {
        id: 'sample', title: 'Population vs sample',
        body: `<div class="prose"><p>The <strong>population</strong> is all objects or events under study. A <strong>sample</strong> is a representative subset of it. We sample because dealing with the entire data is sometimes too hard or expensive. The catch: a sample statistic wobbles around the true population value.</p></div>
        ${W('sample')}`
      },
      {
        id: 'central', title: 'Central tendency: mean, median, mode',
        body: `<div class="prose">
          <p>Central tendency asks whether some values are more typical than others. Three measures:</p>
          <ul>
            <li><strong>Mean</strong>: x̄ = (x₁ + x₂ + ... + x_N) / N. <strong>Sensitive to outliers</strong>; outliers can skew it, so you may need to trim them. We are also often unsure whether a sample mean is representative.</li>
            <li><strong>Median</strong>: order the values and take the middle one. If N is odd, it is the middle value; if N is even, it is the average of the two middle values. It is <strong>expensive</strong> to compute because it needs sorting.</li>
            <li><strong>Mode</strong>: the most repeated value. Works for <strong>quantitative and qualitative</strong> data. A dataset can have <strong>no mode, be unimodal, bimodal or trimodal</strong>.</li>
          </ul>
        </div>
        ${W('central')}
        ${K('Skew in one line: the mean gets pulled toward the tail. <b>Positive (right) skew: mode &lt; median &lt; mean.</b> <b>Negative (left) skew: mean &lt; median &lt; mode.</b> Symmetric: all three roughly equal.')}`
      },
      {
        id: 'weighted', title: 'Weighted mean',
        body: `<div class="prose"><p>Use a <strong>weighted mean</strong> when certain values matter more than others. Its accuracy depends on the weights.</p></div>
        <div class="formula">x̄ = (w₁x₁ + w₂x₂ + ... + w_Nx_N) / (w₁ + w₂ + ... + w_N)</div>
        ${W('weighted')}
        ${T('The lecture example (500 pieces at 100 LE, 300 at 800 LE, 100 at 20 LE) asks for the average price per piece. Weight by quantity: 292,000 / 900 = <b>324.44 LE</b>. The plain mean of the three prices (306.67 LE) is wrong because it ignores how many pieces were bought at each price.')}`
      },
      {
        id: 'dispersion', title: 'Dispersion and the five-number summary',
        body: `<div class="prose"><p>Dispersion says how widespread the data is.</p>
        <ul>
          <li><strong>Variance</strong>: the average of the squared differences from the mean.</li>
          <li><strong>Standard deviation</strong>: the square root of the variance; roughly how far values sit from the mean, in the original units.</li>
          <li><strong>Range</strong>: max minus min.</li>
          <li><strong>Quantiles</strong>: points at regular intervals, such as percentiles and quartiles.</li>
        </ul></div>
        <div class="formula">σ² = Σ(xᵢ − x̄)² / N &nbsp;&nbsp;&nbsp; σ = √σ²</div>
        ${W('dispersion')}
        <div class="prose" style="margin-top:20px"><p>The <strong>five-number summary</strong> is Min, Q1, Median (Q2), Q3, Max. A <strong>box plot</strong> draws it: the box spans Q1 to Q3 (the IQR), the line inside is the median, whiskers reach the furthest points within 1.5 × IQR, and anything beyond is drawn as an outlier.</p></div>
        ${W('boxbuilder')}`
      },
      {
        id: 'why-viz', title: 'Why visualize?',
        body: `<div class="prose">
          <p><strong>Information visualization</strong>: "the use of computer-supported, interactive, visual representations of abstract data to amplify cognition" (Card, Mackinlay and Shneiderman, 1999). The purpose of visualization is <strong>insight, not pictures</strong>.</p>
          <p>Visualize early, while collecting data, to understand, explore and analyze it. That is <strong>Exploratory Data Analysis (EDA)</strong>. The classic proof is <strong>Anscombe's quartet</strong>: four datasets with nearly identical summary statistics that look completely different when plotted.</p>
        </div>
        ${W('anscombe')}`
      },
      {
        id: 'perception', title: 'Human visual perception',
        body: `${compare(['lightning', 'Stage 1: Pre-attentive', ['Rapid', 'Parallel (whole field at once)', 'Automatic']], ['magnifying-glass', 'Stage 2: Serial', ['Relatively slow', 'Incorporates memory', 'Manual (one item at a time)']])}
        <div class="prose"><p><strong>Hue</strong> is pre-attentive. <strong>Shape</strong> is pre-attentive. <strong>Hue and shape together</strong> (a conjunction) are <strong>not</strong>. Try it: time yourself in each mode and watch the conjunction search get slower as the grid grows.</p></div>
        ${W('preattentive')}
        ${K('Pre-attentive features: length, width, size, curvature, number, intersection, hue, lightness, direction of motion, lighting direction. Encode the one thing you want noticed with <b>one</b> of these, not a combination.')}`
      },
      {
        id: 'purpose', title: 'Charts by purpose',
        body: `${terms([
          ['chart-bar', 'Comparison', 'Column charts, bar charts, line charts. Use when you have groups.'],
          ['chart-bar-horizontal', 'Distribution', 'Histograms, line charts, scatter plots, maps. See the full data; useful for outlier analysis.'],
          ['chart-scatter', 'Relationship', 'Scatter plot, bubble chart, line charts. Look at multiple attributes; add dimensions via bubble size and color.'],
          ['chart-pie-slice', 'Composition', 'Parts of a whole within the same category, e.g. stacked columns.'],
        ])}
        ${W('purpose')}`
      },
    ],
  },
  // ------------------------------------------------------------------ L4
  {
    id: 'l4', kind: 'lecture', num: 'L4', icon: 'chart-bar',
    title: 'Data Exploration III: Visualization',
    short: 'Choosing the right chart, bar vs histogram, why pie charts fail, scatter and bubble plots, Gestalt.',
    goals: ['Pick a chart from 4 factors', 'Use bar variants', 'Separate histogram from bar chart', 'Name all 8 Gestalt principles'],
    sections: [
      {
        id: 'goal', title: 'Choosing a visualization',
        body: `<div class="prose"><p>The goal of visualization is to <strong>communicate information as clearly and accurately as possible</strong>. It is both a <strong>science</strong> (understanding data types and statistical principles) and an <strong>art</strong> (designing intuitive, pleasing graphics).</p>
        <p>Four factors decide the chart: <strong>number of variables</strong>, <strong>number of data points</strong>, whether <strong>time</strong> is a factor, and the <strong>nature of the data</strong> (categorical, continuous or mixed).</p></div>
        ${W('chooser')}`
      },
      {
        id: 'line', title: 'Line and bar charts',
        body: `<div class="prose"><p><strong>Line charts</strong> track changes and trends over time, compare groups with multiple lines, emphasize continuity and show fluctuations. Best practice: <strong>at most 4 to 5 lines</strong>.</p>
        <p><strong>Bar charts</strong> show nominal or ordinal categories on one axis and a numeric value on the other, to compare a metric across groups. Variations: <strong>vertical</strong> (most common), <strong>horizontal</strong> (long labels), <strong>stacked</strong> (composition), <strong>grouped</strong> (sub-categories within categories).</p></div>
        ${W('barvariants')}`
      },
      {
        id: 'pie', title: 'Pie charts: use with caution',
        body: `<div class="prose"><p>Expert recommendation: <strong>avoid pie charts</strong>. Humans struggle to compare angles, pies get cluttered with many categories, and they cannot show change over time. Test yourself below.</p></div>
        ${W('piebar')}`
      },
      {
        id: 'hist', title: 'Box plots and histograms',
        body: `<div class="prose"><p><strong>Box plots</strong> highlight quartiles, median, range and outliers. <strong>Histograms</strong> show the distribution of all values with <strong>no gaps between bars</strong>, using ranges called <strong>bins</strong>. Use histograms to see the shape (symmetric, skewed, bimodal), central tendency and spread.</p></div>
        ${W('histbins')}
        ${W('samebox')}
        ${T('<b>Bar charts are for categorical data; histograms are for continuous data.</b> Gaps between bars signal separate categories. A histogram has no gaps because its bins are adjacent ranges of one continuous variable.')}`
      },
      {
        id: 'scatter', title: 'Scatter and bubble plots',
        body: `<div class="prose"><p>Scatter plots study the <strong>relationship between two numerical variables</strong> (summarized by the <strong>correlation coefficient</strong>) and show their distribution. Add a third variable as bubble size to get a <strong>bubble plot</strong>, but set priorities: the x-y relationship is always read more easily than the third variable.</p></div>
        ${W('scatter')}`
      },
      {
        id: 'gestalt', title: 'Gestalt psychology',
        body: `<div class="prose"><p>We see the <strong>whole picture at once</strong> rather than a collection of parts. Eight grouping rules, each with a live demo:</p></div>
        ${W('gestalt')}
        ${K('Good Gestalt is the <b>Law of Prägnanz</b> ("good figure"): our brains make figures as simple and orderly as possible. It underlies all the other principles.')}`
      },
    ],
  },
  // ------------------------------------------------------------------ L5
  {
    id: 'l5', kind: 'lecture', num: 'L5', icon: 'palette',
    title: 'Data Exploration IV: Color & Complex Data',
    short: 'Hue, saturation and lightness, the four color schemes, and charts for high-dimensional data.',
    goals: ['Explain HSL', 'Pick binary, qualitative, sequential or diverging', 'Spot misleading color', 'Choose SPLOM, heat map, stacked or area'],
    sections: [
      {
        id: 'hsl', title: 'Choosing colors',
        body: `<div class="prose"><p>Color has three dimensions. <strong>Hue</strong>: which color on the wheel. <strong>Saturation</strong>: how bold or pale. <strong>Lightness</strong>: tinting and shading. Color calls attention to information, increases appeal and increases memorability.</p></div>
        ${W('hsl')}
        ${T('Gray scale is <b>risky</b>: if the viewer prints in black and white or is color-blind, hues that differ only in hue collapse to the same gray. Differences in <b>lightness</b> survive; differences in hue alone do not.')}`
      },
      {
        id: 'schemes', title: 'The four color schemes',
        body: `${terms([
          ['circle-half', 'Binary', 'Nominal differences split into exactly two categories.'],
          ['swatches', 'Qualitative', 'Different hues for nominal or type differences. Give the lightest, darkest or most saturated hue to what you want emphasized.'],
          ['arrows-out-line-horizontal', 'Diverging', 'Progression outward from a critical midpoint. Two hues diverge from a shared light middle toward dark extremes.'],
          ['gradient', 'Sequential', 'Ordered low to high. Light means low, dark means high. Hue may shift, but light-to-dark must dominate.'],
        ])}
        ${W('schemes')}
        ${K('Profit vs loss is the classic <b>diverging</b> case: zero is the critical midpoint. A sequential or rainbow scheme here is misleading because it hides where profit turns into loss.')}`
      },
      {
        id: 'complex', title: 'Complex, high-dimensional data',
        body: `<div class="prose"><p>Complex data has many attributes (high dimensionality). Tools from the lecture: <strong>gradation</strong>, the <strong>scatter plot matrix</strong> (pairwise plots of the variables in a matrix), <strong>bubble charts</strong> for extra dimensions, <strong>stacked column charts</strong>, <strong>heat maps</strong> (where is the focus; useful for UI/UX) and <strong>area charts</strong>.</p></div>
        ${W('splom')}
        ${W('heatmap')}
        ${W('stackarea')}
        <div class="prose" style="margin-top:16px"><p>Always <strong>label</strong>: unlabeled axes and legends force the viewer to guess, and guessing is how charts mislead.</p></div>`
      },
    ],
  },
  // ------------------------------------------------------------------ L6
  {
    id: 'l6', kind: 'lecture', num: 'L6', icon: 'broom',
    title: 'Data Preprocessing',
    short: 'Data problems, seven quality dimensions, the four preprocessing tasks, and handling missing values.',
    goals: ['Name 4 data problems', 'Name 7 quality dimensions', 'Separate cleaning, integration, reduction, transformation', 'Choose a missing-value strategy'],
    sections: [
      {
        id: 'why', title: 'What and why',
        body: `<div class="prose"><p>Preprocessing transforms <strong>raw data into an understandable format</strong>, improves the quality of the data (usability and reliability) and so improves the quality of mined patterns. We need it because of huge amounts of data, high dimensionality (lots of features) and missing or inaccurate values.</p></div>
        ${terms([
          ['text-aa', 'Inconsistent formatting', 'The same element spelled differently, like "US" vs "U.S.".'],
          ['empty', 'Missing data', 'A first name or email missing from a contacts database.'],
          ['x-circle', 'Inaccurate data', 'Just not the right information, or not updated.'],
          ['copy', 'Duplicate data', 'The same record counted twice.'],
        ])}
        ${K('Why is it challenging? It depends on the dataset. There is no one-size-fits-all tool, so you work case by case and automate the parts that repeat.')}`
      },
      {
        id: 'quality', title: 'Seven dimensions of data quality',
        body: `<div class="tbl-wrap" style="margin-bottom:16px"><table class="tbl">
          <tr><th>Dimension</th><th>Question it asks</th></tr>
          <tr><td><strong>Accuracy</strong></td><td>Is the data correct?</td></tr>
          <tr><td><strong>Completeness</strong></td><td>Do we have everything we need?</td></tr>
          <tr><td><strong>Consistency</strong></td><td>Does data match across places (units, formats)?</td></tr>
          <tr><td><strong>Timeliness</strong></td><td>Is it updated and available when needed?</td></tr>
          <tr><td><strong>Integrity</strong></td><td>Are needed relationships and cascades enforced?</td></tr>
          <tr><td><strong>Believability</strong></td><td>Is the data trustable?</td></tr>
          <tr><td><strong>Interpretability</strong></td><td>Can we easily understand the data and results?</td></tr>
        </table></div>
        ${W('quality')}`
      },
      {
        id: 'tasks', title: 'The four preprocessing tasks',
        body: `${terms([
          ['broom', 'Cleaning', 'Identify and remove outliers, remove incorrect data, handle incomplete and inaccurate data.'],
          ['git-merge', 'Integration', 'Combine sources into one dataset: schema integration, the entity identification problem (student_id vs student_name), resolving value conflicts in formats.'],
          ['arrows-in', 'Reduction', 'Reduce volume: dimensionality reduction (combine attributes), numerosity reduction (smaller representation), compression (lossless or lossy).'],
          ['arrows-clockwise', 'Transformation', 'Change format or structure: smoothing (remove noise), aggregation (summarize), discretization (continuous into intervals), normalization (smaller range).'],
        ])}
        ${W('transform')}`
      },
      {
        id: 'cleaning', title: 'Data cleaning in practice',
        body: `<div class="prose"><ul>
          <li><strong>Noisy data</strong>: errors or outliers, e.g. <code>age = -20</code> (error), or every birthday on <strong>January 1st</strong> (intentional, <strong>disguised missing data</strong>).</li>
          <li><strong>Incomplete data</strong>: did we collect only aggregates? Are attributes missing?</li>
          <li><strong>Inconsistent data</strong>: different formats, changes of scale.</li>
        </ul></div>
        ${W('cleaner')}`
      },
      {
        id: 'missing', title: 'Handling missing values',
        body: `${steps([
          ['Ignore the tuple', 'You lose data, and the loss may have a pattern. Missing values can signal another problem (e.g. network issues) or that the value really does not exist.'],
          ['Fill manually', 'Time consuming; not feasible for large datasets.'],
          ['Global constant', 'Use a label like "unknown". Risk: the program may treat "unknown" as an interesting pattern.'],
          ['Univariate imputation', 'Mean or median of the existing values. Only if missing data is about 2-3%. Prefer the median for skewed data.'],
          ['Multivariate: class mean', 'Mean or median of samples in the same class, e.g. average income of customers in the same credit-risk category.'],
          ['Multivariate: most probable value', 'Predict it with regression, a Bayesian formalism or decision-tree induction, using the rest of the data.'],
        ])}
        ${W('impute')}
        ${T('Mean vs median for imputation: on <b>skewed</b> data (like income) the mean is dragged by the tail, so <b>median</b> is the safer fill. On roughly symmetric data the two are close.')}`
      },
    ],
  },
  // ------------------------------------------------------------------ LAB 1
  {
    id: 'lab1', kind: 'lab', num: 'Lab 1', icon: 'code',
    title: 'Web Scraping & EDA',
    short: 'requests + BeautifulSoup, the DOM, scraping ethics, and exploratory analysis of the Adult dataset.',
    goals: ['Read the DOM', 'Use find_all, select, get_text', 'Scrape ethically', 'Run the EDA checklist', 'Know ydata-profiling and Sweetviz'],
    sections: [
      {
        id: 'pipeline', title: 'The scraping pipeline',
        body: `${steps([
          ['Request', '<code>requests.get(url)</code> downloads the raw HTML.'],
          ['Parse', '<code>BeautifulSoup(response.content, "lxml")</code> turns it into a navigable tree.'],
          ['Locate', 'Use Chrome DevTools (Inspect) to find the tags, classes and IDs that hold your data.'],
          ['Extract', '<code>find</code> / <code>find_all</code> or CSS <code>select</code> / <code>select_one</code>, then <code>.get_text(strip=True)</code>.'],
          ['Store', 'Collect into lists, build a <code>pd.DataFrame</code>, save with <code>to_csv</code>.'],
        ])}
        ${W('dom')}
        ${T('<code>find_all</code> returns a <b>list</b> of tags; <code>find</code> returns the <b>first</b> match or <code>None</code>. That is why the lab checks <code>if name and username_tag and repos:</code> before calling <code>.get_text()</code>: calling it on <code>None</code> crashes.')}`
      },
      {
        id: 'pagination', title: 'Paginated scraping (quotes exercise)',
        body: `<pre class="code"><span class="k">base_url</span> = <span class="s">"https://quotes.toscrape.com/page/{}/"</span>
all_quotes, page = [], 1
<span class="k">while</span> True:
    soup = BeautifulSoup(requests.get(base_url.format(page)).text, <span class="s">"html.parser"</span>)
    blocks = soup.select(<span class="s">"div.quote"</span>)
    <span class="k">if not</span> blocks: <span class="k">break</span>            <span class="c"># stop when a page has no quotes</span>
    <span class="k">for</span> b <span class="k">in</span> blocks:
        all_quotes.append({
            <span class="s">"quote"</span>:  b.select_one(<span class="s">"span.text"</span>).get_text(strip=True),
            <span class="s">"author"</span>: b.select_one(<span class="s">"small.author"</span>).get_text(strip=True),
            <span class="s">"tags"</span>:   <span class="s">", "</span>.join(t.get_text(strip=True) <span class="k">for</span> t <span class="k">in</span> b.select(<span class="s">"div.tags a.tag"</span>)),
        })
    page += 1
df = pd.DataFrame(all_quotes)
df = df.drop_duplicates(subset=<span class="s">"quote"</span>)
df[<span class="s">"quote_length"</span>] = df[<span class="s">"quote"</span>].apply(<span class="k">lambda</span> x: len(x.split()))
df[<span class="s">"num_tags"</span>] = df[<span class="s">"tags"</span>].apply(<span class="k">lambda</span> x: len(x.split(<span class="s">", "</span>)) <span class="k">if</span> pd.notna(x) <span class="k">else</span> 0)</pre>
        <div class="prose"><p>Images follow the same idea: <code>soup.select("div.image_container img")</code>, build an absolute URL with <code>urljoin(base, img["src"])</code>, download the bytes and write them with <code>open(path, "wb")</code>.</p></div>`
      },
      {
        id: 'ethics', title: 'Ethics and advanced tools',
        body: `${terms([
          ['scroll', 'Respect Terms of Service', 'Many sites forbid scraping. Ignoring that is unethical and legally risky.'],
          ['robot', 'Check robots.txt', 'Tells crawlers which parts of a site may be accessed.'],
          ['lock', 'Data privacy', 'Personal data (emails, phones, medical records) can violate laws such as GDPR.'],
        ])}
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Tool</th><th>What it is</th><th>Use when</th></tr>
          <tr><td><strong>BeautifulSoup + requests</strong></td><td>Parser + HTTP client</td><td>Simple, static pages</td></tr>
          <tr><td><strong>Scrapy</strong></td><td>Full crawling framework</td><td>Large scale: thousands of product pages, export to CSV/JSON</td></tr>
          <tr><td><strong>Selenium</strong></td><td>Browser automation</td><td>JavaScript-heavy pages, infinite scroll</td></tr>
          <tr><td><strong>Playwright</strong></td><td>Modern headless automation by Microsoft</td><td>Logins, complex interactions; Chromium, Firefox, WebKit</td></tr>
          <tr><td><strong>Requests-HTML</strong></td><td>Requests + mini JS renderer</td><td>Moderate JavaScript, lighter than Selenium</td></tr>
        </table></div>`
      },
      {
        id: 'eda', title: 'EDA on the Adult income dataset',
        body: `<div class="prose"><p><strong>Exploratory Data Analysis</strong> summarizes the main characteristics of a dataset to find patterns, relationships and trends. Run the lab's checklist on the real <code>adult.csv</code> (48,842 rows, 15 columns):</p></div>
        ${W('eda')}
        ${T('<code>df.isna().sum()</code> reports <b>zero</b> missing values in adult.csv, yet workclass, occupation and native-country contain "?". Missing values can be disguised. Always check unique values, then convert with <code>na_values="?"</code> or <code>df.replace("?", np.nan)</code>.')}`
      },
      {
        id: 'auto', title: 'Automated EDA',
        body: `${compare(['file-html', 'ydata-profiling (formerly pandas-profiling)', ['<code>ProfileReport(df).to_file("Report.html")</code>', 'Missing-value heatmap, duplicates detection', 'Correlation warnings (Pearson, Spearman, Phik)', 'Distribution of every variable, interactions, outliers']], ['chart-line-up', 'Sweetviz', ['<code>sv.analyze(df, target_feat="income")</code>', 'Self-contained HTML report built around a target', '<code>sv.compare([train,"Train"],[test,"Test"])</code> compares two datasets', 'Fast, visual, good for train/test checks']])}
        ${K('Manual EDA feels limited: you cannot easily explore every variable, correlation and interaction by hand. Automated reports cover breadth; your manual plots cover the specific questions.')}`
      },
    ],
  },
  // ------------------------------------------------------------------ LAB 2
  {
    id: 'lab2', kind: 'lab', num: 'Lab 2', icon: 'funnel',
    title: 'Data Cleaning & Visualization',
    short: 'pandas missing-value functions, Z-score and IQR outlier removal on real data, Bokeh, Plotly and Dash.',
    goals: ['Use dropna, fillna, ffill, bfill', 'Remove outliers with Z-score and IQR', 'Know Bokeh, Plotly, Dash roles', 'Explain a Dash callback'],
    sections: [
      {
        id: 'nulls', title: 'Missing values in pandas',
        body: `<div class="prose"><p>The default null is <code>NaN</code>. If a dataset uses another symbol (like "?"), convert it first with the <code>na_values</code> argument of <code>read_csv</code>. The tools: <code>isnull()</code>, <code>notnull()</code>, <code>dropna()</code> (with <code>how="any"</code> or <code>how="all"</code>) and <code>fillna()</code> with a single value or a dict per column.</p>
        <p>In <code>retail_transactions.csv</code> (12,575 rows) about 6% of all cells are null, concentrated in item (1,213), price_per_unit (609), quantity (604), total_spent (604) and discount_applied (4,199). Dropping every row with a null would throw away a large share of the data, so the lab fills instead.</p></div>
        ${W('fillna')}
        ${T('<b>ffill</b> copies the most recent non-missing value forward; <b>bfill</b> copies the next non-missing value backward. Mixing them up is a common exam slip.')}`
      },
      {
        id: 'outliers', title: 'Outliers: Z-score and IQR',
        body: `<div class="prose"><p>An outlier is an observation far from the others. Causes: measurement or input error, data corruption, or a true rare observation. There is no universal definition, so a domain expert decides. Outliers can be <strong>univariate</strong> (one variable) or <strong>multivariate</strong> (unusual in n dimensions).</p>
        <p>The lab uses <code>placement.csv</code>: <code>cgpa</code> is roughly normal, <code>placement_exam_marks</code> is right-skewed. So it applies <strong>Z-score to cgpa</strong> and <strong>IQR to the skewed marks</strong>. Move the thresholds on the real 1,000 students:</p></div>
        ${W('outliers')}
        ${K('Z-score suits <b>normal</b> data (flag |z| &gt; 3). IQR suits <b>skewed</b> data (flag below Q1 − 1.5·IQR or above Q3 + 1.5·IQR). A flagged point is a candidate, not an automatic deletion: in retail data, a huge total_spent may be a real bulk purchase.')}`
      },
      {
        id: 'libs', title: 'Bokeh, Plotly and Dash',
        body: `<div class="tbl-wrap"><table class="tbl">
          <tr><th>Library</th><th>What it is</th><th>Key pieces from the lab</th></tr>
          <tr><td><strong>Bokeh</strong></td><td>Interactive plots for the browser</td><td><code>figure</code>, glyphs (<code>line</code>, <code>scatter(marker=...)</code>), <code>ColumnDataSource</code>, <code>HoverTool</code>, <code>box_select</code>/<code>lasso_select</code>, <code>row</code>/<code>column</code>/<code>gridplot</code>, <code>Tabs</code>+<code>TabPanel</code>, <code>output_file</code>, <code>show</code></td></tr>
          <tr><td><strong>Plotly</strong></td><td>Publication-quality interactive graphs</td><td><b>Plotly Express</b> (high level: <code>px.scatter</code>, <code>px.scatter_map</code>, <code>px.density_map</code>, <code>px.scatter_geo</code>, <code>px.line_polar</code>, <code>px.line_3d</code>) and <b>Graph Objects</b> (low level: <code>go.Bar</code>, <code>go.Mesh3d</code>)</td></tr>
          <tr><td><strong>Dash</strong></td><td>Python framework on React, Plotly and Flask for dashboards without JavaScript</td><td><code>Dash</code> app, <code>html</code> components, <code>dcc</code> controls (Dropdown, Graph, Slider), <code>@app.callback(Output, Input)</code></td></tr>
        </table></div>
        <div class="prose" style="margin-top:16px"><p>A Dash <strong>callback</strong> connects inputs to outputs: when an Input property changes, Dash calls your function and writes its return value to the Output property. Try it:</p></div>
        ${W('dash')}`
      },
    ],
  },
  // ------------------------------------------------------------------ LAB 3
  {
    id: 'lab3', kind: 'lab', num: 'Lab 3', icon: 'squares-four',
    title: 'Power BI I: Extract, Transform, Load',
    short: 'Power BI features, real company cases, and the Get Data, Power Query, Load workflow on the remote-work dataset.',
    goals: ['List Power BI key features', 'Match cases to outcomes', 'Walk Get Data → Transform → Load', 'Fix inconsistent categories in Power Query'],
    sections: [
      {
        id: 'features', title: 'What Power BI is',
        body: `<div class="prose"><p>Microsoft <strong>Power BI</strong> is a suite of business analytics tools to connect to data, transform it and tell stories with visualizations.</p></div>
        ${terms([
          ['plugs-connected', 'Data connectivity', 'Databases, files, online services.'],
          ['funnel-simple', 'Data transformation', 'Cleaning and shaping with Power Query.'],
          ['chart-donut', 'Data visualization', 'Charts, graphs and custom visuals.'],
          ['function', 'DAX', 'Data Analysis Expressions: a formula language for custom calculations.'],
          ['cursor-click', 'Interactive dashboards', 'Slicers, drill-through reports and more.'],
          ['share-network', 'Sharing and collaboration', 'Publish and share reports securely.'],
        ])}`
      },
      {
        id: 'cases', title: 'Who uses it and why',
        body: `${W('cases')}`
      },
      {
        id: 'workflow', title: 'Building the dashboard: E, T, L in Power BI',
        body: `<div class="prose"><p>Scenario: a global tech firm moved to remote work. HR sees mixed signals on work-life balance, stress and satisfaction, and uses <strong>5,000 employee records</strong> (work location, stress level, access to mental-health resources, satisfaction) to investigate.</p></div>
        ${steps([
          ['Extract: Get Data', 'Home → Get Data, choose the source type (Text/CSV here), pick the file. A preview appears with Load or Transform.'],
          ['Transform: Clean', 'Transform opens the Power Query Editor: change types, replace values, add columns, run queries. Explore the Transform, Add Column and View tabs.'],
          ['Transform: Convert', 'Convert data into a consistent format and structure suitable for analysis.'],
          ['Load', 'Close & Apply. Fields appear in the Data pane; the left rail switches between Report, Table and Model (relationships) views.'],
        ])}
        ${W('powerquery')}`
      },
      {
        id: 'viz', title: 'Asking the dataset a question',
        body: `<div class="prose"><p>Once clean, the classic first visual is a matrix or heat map of <strong>Work_Location × Stress_Level</strong>. Real counts from the lab CSV:</p></div>
        ${W('heatmap')}
        ${K('Notice the counts are almost flat (535 to 590 per cell). A good analyst reports that honestly: in this dataset, work location alone barely moves stress. That is an insight too.')}`
      },
    ],
  },
  // ------------------------------------------------------------------ LAB 4
  {
    id: 'lab4', kind: 'lab', num: 'Lab 4', icon: 'cursor-click',
    title: 'Power BI II: Sources & Interactivity',
    short: 'Loading from APIs and SQL Server, Merge Queries, tooltips, drill down vs drill through, buttons, bookmarks, Python visuals.',
    goals: ['Load JSON from an API', 'Load from SQL Server', 'Merge queries on a key', 'Separate drill down from drill through', 'Use buttons and bookmarks'],
    sections: [
      {
        id: 'api', title: 'Different sources: API and SQL',
        body: `${steps([
          ['Get an API key', 'Sign up on a provider such as OpenWeather.'],
          ['Build the URL', '<code>https://api.openweathermap.org/data/2.5/weather?q=Cairo&amp;appid=YOUR_KEY&amp;units=metric</code>'],
          ['Get Data → Web', 'Paste the URL. Power BI receives nested JSON.'],
          ['Expand JSON', 'Expand the records you need: temp, humidity, description.'],
          ['Visualize', 'Card for temperature, Gauge for humidity, Table for details.'],
        ])}
        ${W('api')}
        <div class="prose" style="margin-top:20px"><p><strong>SQL Server</strong>: Get Data → SQL Server, enter the server (e.g. <code>localhost</code>) and database (<code>AdventureWorksLT</code>, restored from a <code>.bak</code> with <code>RESTORE DATABASE ... FROM DISK ... WITH MOVE ...</code>). Select the tables; <strong>relationships are auto-detected</strong>; load and build.</p></div>`
      },
      {
        id: 'merge', title: 'Data integration: Merge Queries',
        body: `${steps([
          ['Load both datasets', 'Each becomes a query.'],
          ['Transform Data', 'Open Power Query.'],
          ['Merge Queries as New', 'Pick the two queries.'],
          ['Select the common columns', 'Choose the key in each table and the join kind.'],
          ['Close & Apply', 'The merged table loads into the model.'],
        ])}
        ${W('merge')}`
      },
      {
        id: 'drill', title: 'Tooltips, drill down and drill through',
        body: `<div class="prose"><p><strong>Tooltips</strong> show extra details when you hover a data point (and also appear on labels, buttons and images). In a bar chart of sales by category you can add extra columns as tooltip fields.</p></div>
        ${compare(['arrow-down', 'Drill down', ['Explore levels of detail <b>within the same visual</b>', 'Year → month → day, or Category → Sub-Category → Product', 'Built from a hierarchy (Model view → right-click → Create hierarchy)', 'Up arrow goes back']], ['arrow-square-out', 'Drill through', ['Navigate to <b>a different report page</b> filtered to one data point', 'Right-click a point → Drill through', 'Built by adding a field to the target page\'s Drill through filters', 'Detail page: cards, table, image']])}
        ${W('drill')}`
      },
      {
        id: 'buttons', title: 'Buttons, bookmarks, multi-row cards, Python',
        body: `${terms([
          ['hand-pointing', 'Buttons', 'Insert → Buttons. Actions: page navigation, drill through, bookmark, Q&amp;A, reset filters. Set the Action in the Format pane.'],
          ['bookmark-simple', 'Bookmarks', 'Capture a page state (filters, slicers, visibility). View → Bookmarks pane → set up the page → Add → rename. Use for show/hide, data stories, navigation.'],
          ['rows', 'Multiple-row card', 'Shows several fields compactly, ideal for key metrics. Can show product images via an image URL column set to the Image URL category.'],
          ['file-py', 'Python visual', 'File → Options → Python scripting (check the Python path), insert a Python visual, drag features and target into Values, paste the script, run. Use it to show predictions next to actuals.'],
        ])}
        ${W('bookmarks')}`
      },
    ],
  },
  // ------------------------------------------------------------------ LAB 5
  {
    id: 'lab5', kind: 'lab', num: 'Lab 5', icon: 'book-open-text',
    title: 'Data Storytelling with Data Studio',
    short: 'Dashboards vs data stories, What / So what / Now what, the 7-step workflow, a full dashboard makeover and the 10-second test.',
    goals: ['Separate a dashboard from a story', 'Write a big-idea sentence', 'Apply What / So what / Now what', 'Fix the 8 dashboard mistakes', 'Run the 10-second test'],
    sections: [
      {
        id: 'story', title: 'Dashboard vs data story',
        body: `${compare(['squares-four', 'Dashboard', ['Multiple charts and metrics', 'Allows exploration', 'Shows what happened', 'Often leaves interpretation to the viewer']], ['book-open-text', 'Data story', ['Has a clear message', 'Selects the most relevant evidence', 'Explains what changed and why it matters', 'Guides the viewer toward an action']])}
        ${K('A dashboard gives the viewer data; a data story gives the viewer a way to <b>understand</b> it. The problem with a cluttered dashboard is not the amount of data, it is that the viewer has to do all the work: search, decide, compare, figure out the message.')}
        <div class="prose"><p>A strong data story <strong>selects, organizes, highlights, explains and recommends</strong>, answering three viewer questions: what happened, why does it matter, what should I do?</p></div>
        ${W('whatso')}`
      },
      {
        id: 'workflow', title: 'The 7-step workflow',
        body: `${steps([
          ['Define audience and big idea', '[Audience] needs to know [finding] so they can [action].'],
          ['Prepare, clean and organize the data', 'Good stories start with good data. Prepare first, visualize second.'],
          ['Map the story to pages', 'Beginning, middle, end: Context → Insight → Action.'],
          ['Choose the right chart for the question', 'Start with the question, not the chart.'],
          ['Direct the viewer\'s attention', 'If everything has equal importance, nothing is important.'],
          ['Add interactivity with care', 'The default view must already tell the story.'],
          ['Test whether the story is understood', 'The 10-second test.'],
        ])}
        ${W('bigidea')}
        <div class="tbl-wrap" style="margin-top:18px"><table class="tbl">
          <tr><th>Act</th><th>Shows</th><th>Weak title (a label)</th><th>Strong title (a finding)</th></tr>
          <tr><td><strong>Context</strong></td><td>KPIs, current performance, key comparison</td><td>Overview</td><td>Water use rose [x]% this quarter</td></tr>
          <tr><td><strong>Insight</strong></td><td>Trends, comparisons, key findings</td><td>Usage by greenhouse</td><td>Greenhouse B drives most of the rise</td></tr>
          <tr><td><strong>Action</strong></td><td>Recommendations, explanation, details</td><td>Details</td><td>Fixing B's sensors can cut the waste</td></tr>
        </table></div>
        ${T('Data prep has an <b>Avoid</b> list: doing heavy cleaning inside the report, creating many unnecessary calculated fields, and using inconsistent metric definitions. The tool comes after the story is planned: Plan → Build → Test.')}`
      },
      {
        id: 'charts', title: 'Choose the right chart, direct attention',
        body: `${W('chartq')}
        <div class="prose" style="margin-top:18px"><p><strong>Direct attention</strong> with reference lines for targets, text-box annotations, conditional formatting and a colorblind-safe accent. <strong>Interaction</strong> (date range control, drop-down filter, drill down, cross-source filter) must support the story: filters help viewers explore but should never be needed to understand.</p>
        <p><strong>Style</strong> follows four rules: consistency (similar charts look similar), focus (no needless decoration or excess color), readability (clear fonts, sizes, spacing) and hierarchy (important information stands out).</p></div>`
      },
      {
        id: 'makeover', title: 'The dashboard makeover',
        body: `<div class="prose"><p>Raw data: e-commerce orders (order_id, date, category, device, region, qty, price, revenue, plus hour, weekday, payment method, discount) across 18 products in 5 categories. Questions to ask before charting: <strong>Trend</strong> (growing or shrinking?), <strong>Segment</strong> (device, category, region?), <strong>Anomaly</strong> (a week that breaks the pattern?), <strong>Driver</strong> (which segment caused a change?).</p></div>
        ${W('makeover')}
        ${K('Hidden in the lab data: Electronics revenue on <b>mobile</b> fell from about $18.9K in April to about $9.0K in May, a 52% drop, while desktop stayed flat. That is a Driver finding, and only slicing by device reveals it.')}`
      },
      {
        id: 'datastudio', title: 'Data Studio and the 10-second test',
        body: `<div class="prose"><p><strong>Data Studio</strong> (Google's reporting tool, also known as Looker Studio) is a web-based reporting tool: connects to hundreds of sources (Google Analytics, Ads, BigQuery, Sheets, third parties), drag-and-drop charts, real-time updates, and Google Docs-style sharing.</p></div>
        ${steps([
          ['Create a report', 'Data Source → Connect → Select Dataset → Create Report. Check the data before designing.'],
          ['Insert a chart', 'Pick the visualization that matches the question.'],
          ['Select the dimension', 'Categorical, the "what" you compare (X).'],
          ['Select the metric', 'Numerical, the value you measure (Y).'],
          ['Check aggregation', 'SUM, AVG or COUNT?'],
          ['Sort and filter, then style', 'Does this filter help answer the question? Style supports the message, never competes with it.'],
        ])}
        ${W('tensecond')}`
      },
    ],
  },
];

export const byId = Object.fromEntries(MODULES.map(m => [m.id, m]));

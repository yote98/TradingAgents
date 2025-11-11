# Implementation Plan

- [x] 1. Set up project structure and MCP helper functions


  - Create `tradingagents/agents/analysts/` directory
  - Create `__init__.py` to export analyst functions
  - Implement MCP helper functions in `agent_utils.py` for options, crypto, and macro data retrieval
  - Add tool decorators and proper error handling to helper functions
  - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 4.2, 5.1, 5.2_



- [ ] 2. Update agent state structure
  - Add `options_report`, `crypto_report`, and `macro_report` fields to `AgentState` in `agent_states.py`
  - Update type annotations with proper `Annotated` descriptors

  - Verify backward compatibility with existing state fields

  - _Requirements: 1.5, 2.5, 3.5, 4.3_

- [ ] 3. Implement Options Analyst
  - [ ] 3.1 Create `options_analyst.py` with `create_options_analyst()` function
    - Implement `options_analyst_node()` that retrieves options data via MCP

    - Parse options chain data (calls, puts, strikes, volume, open interest)
    - Calculate key metrics (put/call ratio, max pain, IV percentile)
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 3.2 Implement options analysis logic

    - Create prompt template for LLM-based options analysis
    - Implement strategy identification logic (covered calls, spreads, straddles)
    - Generate structured report with options insights and recommendations
    - _Requirements: 1.3, 1.4_
  
  - [ ] 3.3 Add error handling and data validation
    - Implement retry logic with exponential backoff for API calls
    - Validate options data completeness before analysis
    - Generate partial reports when data is incomplete
    - Include data quality indicators in report metadata
    - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.4, 5.5_

  
  - [x]* 3.4 Create unit tests for Options Analyst

    - Write tests for options data retrieval with mocked MCP responses
    - Test put/call ratio and max pain calculations
    - Test error handling for API failures and missing data
    - _Requirements: 6.1, 6.5_


- [ ] 4. Implement Crypto Analyst
  - [ ] 4.1 Create `crypto_analyst.py` with `create_crypto_analyst()` function
    - Implement `crypto_analyst_node()` that retrieves crypto data via MCP
    - Support multiple data intervals (intraday, daily, weekly, monthly)
    - Parse cryptocurrency price and volume data
    - _Requirements: 2.1, 2.2, 2.5_

  
  - [ ] 4.2 Implement crypto analysis logic
    - Create prompt template for LLM-based crypto analysis
    - Analyze price trends, volatility, and volume patterns
    - Calculate correlation with major cryptocurrencies (BTC, ETH)
    - Generate structured report with crypto market insights
    - _Requirements: 2.3, 2.4_
  
  - [ ] 4.3 Add error handling and data validation
    - Implement retry logic for crypto API calls
    - Validate crypto data for multiple market pairs


    - Handle missing data gracefully with partial analysis
    - Include data quality indicators in report
    - _Requirements: 2.4, 5.1, 5.2, 5.3, 5.4, 5.5_

  
  - [ ]* 4.4 Create unit tests for Crypto Analyst
    - Write tests for crypto data retrieval with mocked responses
    - Test trend detection and volatility calculations
    - Test multi-symbol support (BTC, ETH, altcoins)
    - Test error handling for rate limits and API failures

    - _Requirements: 6.2, 6.5_

- [ ] 5. Implement Macro Analyst
  - [ ] 5.1 Create `macro_analyst.py` with `create_macro_analyst()` function
    - Implement `macro_analyst_node()` that retrieves economic indicators via MCP
    - Support multiple indicators (GDP, unemployment, CPI, inflation, Fed funds rate)
    - Retrieve treasury yield data for multiple maturities

    - Parse economic indicator data
    - _Requirements: 3.1, 3.2_
  
  - [ ] 5.2 Implement macro analysis logic
    - Create prompt template for LLM-based macro analysis
    - Analyze economic cycle and market regime (risk-on/risk-off)
    - Assess monetary policy implications and yield curve
    - Identify correlations between indicators and market conditions
    - Generate structured report with economic outlook and market implications



    - _Requirements: 3.3, 3.4_
  
  - [ ] 5.3 Add error handling and data validation
    - Implement retry logic for economic data API calls
    - Validate economic indicator data completeness
    - Handle missing indicators with partial analysis

    - Include data quality indicators in report
    - _Requirements: 3.4, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 5.4 Create unit tests for Macro Analyst
    - Write tests for economic indicator retrieval with mocked responses
    - Test market regime identification logic
    - Test yield curve analysis

    - Test error handling for missing economic data
    - _Requirements: 6.3, 6.5_

- [ ] 6. Integrate analysts into trading graph
  - [ ] 6.1 Update `trading_graph.py` to register new analysts
    - Add tool nodes for options, crypto, and macro analysts
    - Update `_create_tool_nodes()` method with new analyst tools
    - Register analyst nodes in the LangGraph workflow
    - _Requirements: 4.1, 4.2_
  
  - [ ] 6.2 Update `setup.py` to add analyst nodes to graph
    - Add conditional logic for enabling/disabling new analysts
    - Wire analyst nodes into the graph flow
    - Ensure analysts execute before Research Team
    - Update state propagation to include new analyst reports
    - _Requirements: 4.1, 4.3, 4.4_
  
  - [ ] 6.3 Update configuration system
    - Add "options", "crypto", "macro" to `selected_analysts` configuration
    - Update default configuration with new analyst options
    - Ensure backward compatibility when new analysts are disabled
    - _Requirements: 4.4, 4.5_

- [ ] 7. Create integration tests
  - [x] 7.1 Test individual analyst integration



    - Write integration test for Options Analyst in full workflow
    - Write integration test for Crypto Analyst in full workflow
    - Write integration test for Macro Analyst in full workflow
    - Verify state updates correctly for each analyst
    - Verify reports reach Research Team
    - _Requirements: 6.4_
  
  - [ ] 7.2 Test all analysts working together
    - Create integration test with all analysts enabled (including new ones)
    - Verify no conflicts between analysts
    - Verify all reports are generated and accessible
    - Test workflow performance with all analysts active
    - _Requirements: 4.3, 4.4, 6.4_
  
  - [ ]* 7.3 Create mock data fixtures
    - Create mock MCP responses for options data
    - Create mock MCP responses for crypto data
    - Create mock MCP responses for economic indicators
    - Organize mocks in `tests/mocks/mcp_responses.py`
    - _Requirements: 6.5_

- [ ] 8. Update documentation and examples
  - Update README with information about new analysts
  - Create example script demonstrating Options Analyst usage
  - Create example script demonstrating Crypto Analyst usage
  - Create example script demonstrating Macro Analyst usage
  - Update system architecture documentation
  - _Requirements: 4.5_

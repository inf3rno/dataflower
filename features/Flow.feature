Feature: data flows

  Scenario: sustaining a data flow and extracting data from it
    When I sustain a data flow
    Then I should be able to extract data from it

  Scenario: extracting data from a dry flow leads to failure
    When I have a dry data flow
    Then I should not be able to extract data from it

  Scenario: sustaining a blocked flow leads to failure
    When I have a blocked data flow
    Then I should not be able to sustain it

  Scenario: blocking an already blocked flow leads to failure
    When I have a blocked data flow
    Then I should not be able to block it again
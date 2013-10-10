require 'spec_helper'

class FooController < ActionController::Base
  include Rafters::Context
end

class FooComponent < Rafters::Component; end

describe Rafters::Context do
  let(:controller) { FooController.new }
  let(:renderer) { double("Renderer", render: "<p>Output</p>") }
  let(:component) { controller.send(:component, :foo, as: "foo") }

  before do
    Rafters::Renderer.stub(:new).and_return(renderer)
  end

  describe "#render_component" do
    it "renders the provided component" do
      expect(renderer).to receive(:render).with(instance_of(FooComponent))
      controller.render_component(:foo, as: "foo")
    end

    context "previously initialized component" do
      it "renders the previously initialized component" do
        expect(renderer).to receive(:render).with(component)
        controller.initialized_components[component.identifier] = component
        controller.render_component(:foo, as: "foo")
      end
    end

    context "with options" do
      it "renders the provided component with the given options" do
        expect(FooComponent).to receive(:new).with("foo", { settings: { test: true } }).and_return(component)
        controller.render_component(:foo, { as: "foo", settings: { test: true } })
      end
    end
  end
end
